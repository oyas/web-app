package auth

import (
	"auth/client"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
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

func Parse(ctx context.Context, tokenString string) (*jwt.Token, error) {
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
		fmt.Println(err)
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		fmt.Println(claims)
	} else {
		fmt.Println("Error, Can't cast to jwt.MapClaims.")
	}

	return token, err
}

func GetValidationKey(ctx context.Context, token *jwt.Token) (interface{}, error) {
	// Verify 'aud' claim
	aud := "https://localhost:4000/graphql"
	checkAud := token.Claims.(jwt.MapClaims).VerifyAudience(aud, false)
	if !checkAud {
		return token, errors.New("invalid audience")
	}
	// Verify 'iss' claim
	iss := "https://oyas.jp.auth0.com/"
	checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(iss, false)
	if !checkIss {
		return token, errors.New("invalid issuer")
	}

	cert, err := getPemCert(ctx, token)
	if err != nil {
		return nil, err
	}

	result, _ := jwt.ParseRSAPublicKeyFromPEM([]byte(cert))
	return result, nil
}

func getPemCert(ctx context.Context, token *jwt.Token) (string, error) {
	cert := ""

	url := "https://oyas.jp.auth0.com/.well-known/jwks.json"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return cert, err
	}
	resp, err := client.Http.Do(req)
	if err != nil {
		return cert, err
	}
	defer resp.Body.Close()

	var jwks = Jwks{}
	err = json.NewDecoder(resp.Body).Decode(&jwks)

	if err != nil {
		return cert, err
	}

	for k, _ := range jwks.Keys {
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
