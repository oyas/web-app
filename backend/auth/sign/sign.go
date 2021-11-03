package sign

import (
	"crypto/md5"
	"crypto/rsa"
	"encoding/base64"
	"io/ioutil"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"go.uber.org/zap"
	"common/auth"
	"common/utils"
)

type TokenData struct {
	Sub   string
	Scope string
}

var privateKey = func() *rsa.PrivateKey {
	logger := zap.L().Sugar()
	filepath := utils.GetEnv("SIGNING_KEY_PATH", "./keys/app.rsa")
	logger.Infof("Reading signing key from %v", filepath)
	bytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		logger.Fatalf("Error: can't read signing key: %v", err)
	}
	key, err := jwt.ParseRSAPrivateKeyFromPEM(bytes)
	if err != nil {
		logger.Fatalf("Error: can't read signing key: %v", err)
	}
	return key
}()

func GetPublicKey() *rsa.PublicKey {
	return &privateKey.PublicKey
}

func GetKid() string {
	sum := md5.Sum(privateKey.N.Bytes())
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func Sign(data *TokenData) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"aud":   auth.DefaultParser.Aud,
		"iss":   auth.DefaultParser.Iss,
		"sub":   data.Sub,
		"scope": data.Scope,
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(time.Minute * 10).Unix(),
	})
	token.Header["kid"] = GetKid()

	return token.SignedString(privateKey)
}
