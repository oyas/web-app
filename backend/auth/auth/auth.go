package auth

import (
	"auth/client"
	"context"
	"crypto/rsa"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"go.uber.org/zap"

	"github.com/patrickmn/go-cache"
)

type Jwks struct {
	Keys []JSONWebKeys `json:"keys"`
}

type JSONWebKeys struct {
	Kty string   `json:"kty"`
	Kid string   `json:"kid"`
	Use string   `json:"use"`
	N   string   `json:"n"`
	E   string   `json:"e"`
	X5c []string `json:"x5c"`
}

var keysCache = cache.New(5*time.Minute, 10*time.Minute)

const cacheKey = "key"
const jwksUrl = "https://oyas.jp.auth0.com/.well-known/jwks.json"

func Parse(ctx context.Context, tokenString string) (*jwt.Token, error) {
	logger := zap.L().Sugar()
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Don't forget to validate the alg is what you expect:
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method 1: %v", token.Header["alg"])
		}
		if jwt.SigningMethodRS256 != token.Method {
			return nil, fmt.Errorf("unexpected signing method: %v (%v vs %v)", token.Header["alg"], jwt.SigningMethodRS256.Alg(), token.Method.Alg())
		}

		return GetValidationKey(ctx, token)
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

func GetValidationKey(ctx context.Context, token *jwt.Token) (*rsa.PublicKey, error) {
	// Verify 'aud' claim
	aud := "https://localhost:4000/graphql"
	checkAud := token.Claims.(jwt.MapClaims).VerifyAudience(aud, false)
	if !checkAud {
		return nil, errors.New("invalid audience")
	}
	// Verify 'iss' claim
	iss := "https://oyas.jp.auth0.com/"
	checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(iss, false)
	if !checkIss {
		return nil, errors.New("invalid issuer")
	}

	cert, err := getPemCert(ctx, token)
	if err != nil {
		return nil, err
	}

	return jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
}

func getPemCert(ctx context.Context, token *jwt.Token) (string, error) {
	cert := ""

	var jwks = Jwks{}
	if x, found := keysCache.Get(cacheKey); found {
		jwks = x.(Jwks)
	} else {
		req, err := http.NewRequestWithContext(ctx, "GET", jwksUrl, nil)
		if err != nil {
			return cert, err
		}
		resp, err := client.Http.Do(req)
		if err != nil {
			return cert, err
		}
		defer resp.Body.Close()

		err = json.NewDecoder(resp.Body).Decode(&jwks)
		if err != nil {
			return cert, err
		}

		keysCache.Set(cacheKey, jwks, 24*time.Hour)
	}

	for k := range jwks.Keys {
		if token.Header["kid"] == jwks.Keys[k].Kid {
			cert = "-----BEGIN CERTIFICATE-----\n" + jwks.Keys[k].X5c[0] + "\n-----END CERTIFICATE-----"
		}
	}

	if cert == "" {
		err := errors.New("unable to find appropriate key")
		return cert, err
	}

	return cert, nil
}
