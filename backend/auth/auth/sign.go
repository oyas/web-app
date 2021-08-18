package auth

import (
	"crypto/rsa"
	"io/ioutil"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type TokenData struct {
	Sub   string
	Scope string
}

var privateKey = func() *rsa.PrivateKey {
	var filepath string
	if value, ok := os.LookupEnv("SIGNING_KEY_PATH"); ok {
		filepath = value
	} else {
		filepath = "./keys/app.rsa"
	}
	log.Printf("Reading signing key from %v", filepath)
	bytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		log.Fatalf("Error: can't read signing key: %v", err)
	}
	key, err := jwt.ParseRSAPrivateKeyFromPEM(bytes)
	if err != nil {
		log.Fatalf("Error: can't read signing key: %v", err)
	}
	return key
}()

func Sign(data *TokenData) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"sub":   data.Sub,
		"scope": data.Scope,
		"iat":   time.Now(),
		"exp":   time.Now().Add(time.Minute * 10).Unix(),
	})

	return token.SignedString(privateKey)
}
