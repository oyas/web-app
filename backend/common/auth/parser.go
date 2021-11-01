package auth

import (
	"common/client"
	"context"
	"crypto/rsa"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"time"
	"encoding/base64"

	"github.com/golang-jwt/jwt/v4"
	"go.uber.org/zap"

	"github.com/patrickmn/go-cache"
)

type Parser struct {
	JwksUrl string  // "https://oyas.jp.auth0.com/.well-known/jwks.json"
	Aud     string
	Iss     string
}

var DefaultParser Parser = Parser{
	JwksUrl: "http://auth:3000/jwks.json",
	Aud: "web-app",
	Iss: "web-app",
}

type Jwks struct {
	Keys []JSONWebKeys `json:"keys"`
}

type JSONWebKeys struct {
	Kty string   `json:"kty"`
	Alg string   `json:"alg"`
	Kid string   `json:"kid"`
	Use string   `json:"use"`
	N   string   `json:"n"`
	E   string   `json:"e"`
	X5c []string `json:"x5c"`
}

var keysCache = cache.New(5*time.Minute, 10*time.Minute)

const cacheKey = "key"

func (p *Parser) Parse(ctx context.Context, tokenString string) (*jwt.Token, error) {
	logger := zap.L().Sugar()
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method 1: %v", token.Header["alg"])
		}
		if jwt.SigningMethodRS256 != token.Method {
			return nil, fmt.Errorf("unexpected signing method: %v (%v vs %v)", token.Header["alg"], jwt.SigningMethodRS256.Alg(), token.Method.Alg())
		}

		return p.GetValidationKey(ctx, token)
	})
	if err != nil {
		logger.Warn(err)
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		logger.Info(claims)
	} else {
		logger.Error("Can't cast to jwt.MapClaims.")
	}

	return token, err
}

func (p *Parser) GetValidationKey(ctx context.Context, token *jwt.Token) (*rsa.PublicKey, error) {
	// Verify 'aud' claim
	checkAud := token.Claims.(jwt.MapClaims).VerifyAudience(p.Aud, false)
	if !checkAud {
		return nil, errors.New("invalid audience")
	}
	// Verify 'iss' claim
	checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(p.Iss, false)
	if !checkIss {
		return nil, errors.New("invalid issuer")
	}

	return p.getRSAPublicKey(ctx, token)
}

func (p *Parser) getRSAPublicKey(ctx context.Context, token *jwt.Token) (*rsa.PublicKey, error) {
	logger := zap.L().Sugar()

	jwks, err := getJwks(ctx)
	if err != nil {
		logger.Info("can't get jwks: %v", err)
		return nil, err
	}

	for k := range jwks.Keys {
		if token.Header["kid"] == jwks.Keys[k].Kid {
			if len(jwks.Keys[k].X5c) == 0 || jwks.Keys[k].X5c[0] == "" {
				// use N & E
				n, err := parseBigInt(jwks.Keys[k].N)
				if err != nil {
					logger.Info(err)
					return nil, err
				}
				e, err := parseBigInt(jwks.Keys[k].E)
				if err != nil {
					logger.Info(err)
					return nil, err
				}
				pubkey := &rsa.PublicKey{N: n, E: int(e.Int64())}
				return pubkey, nil
			} else {
				// use X5C
				cert := "-----BEGIN CERTIFICATE-----\n" + jwks.Keys[k].X5c[0] + "\n-----END CERTIFICATE-----"
				return jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
			}
		}
	}

	return nil, errors.New("unable to find appropriate key")
}

func getJwks(ctx context.Context) (*Jwks, error) {
	var jwks = Jwks{}
	if x, found := keysCache.Get(cacheKey); found {
		jwks = x.(Jwks)
	} else {
		req, err := http.NewRequestWithContext(ctx, "GET", p.JwksUrl, nil)
		if err != nil {
			return nil, err
		}
		resp, err := client.Http.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		err = json.NewDecoder(resp.Body).Decode(&jwks)
		if err != nil {
			return nil, err
		}

		keysCache.Set(cacheKey, jwks, 24*time.Hour)
	}
	return &jwks, nil
}

func parseBigInt(s string) (*big.Int, error) {
	buf, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return nil, err
	}
	return new(big.Int).SetBytes(buf), nil
}
