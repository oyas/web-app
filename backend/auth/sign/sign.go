package sign

import (
	"crypto/md5"
	"crypto/rsa"
	"encoding/base64"
	"io/ioutil"
	"path/filepath"
	"time"

	"common/auth"
	"common/log"
	"common/utils"

	"github.com/golang-jwt/jwt/v4"
)

type TokenData struct {
	Sub   string
	Scope string
}

var privateKey = func() *rsa.PrivateKey {
	filepath := utils.GetEnv("SIGNING_KEY_PATH", "./keys/rsa.pem")
	key, err := readPrivateKey(filepath)
	if err != nil {
		log.Panicf("can't read signing key: %v", err)
	}
	return key
}()

var kid = getKid(privateKey)

var privateKeys = func() map[string]*rsa.PrivateKey {
	pattern := utils.GetEnv("SIGNING_KEY_DIR", "./keys") + "/*.pem"
	files, err := filepath.Glob(pattern)
	if err != nil {
		log.Panic(err)
	}
	keys := map[string]*rsa.PrivateKey{}
	for _, file := range files {
		key, err := readPrivateKey(file)
		if err != nil {
			log.Panicf("can't read signing key: %v", err)
		}
		keys[getKid(key)] = key
	}
	keys[getKid(privateKey)] = privateKey
	return keys
}()

func readPrivateKey(filepath string) (*rsa.PrivateKey, error) {
	log.Infof("Reading signing key from %v", filepath)
	bytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		return nil, err
	}
	key, err := jwt.ParseRSAPrivateKeyFromPEM(bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}

func GetPublicKeys() map[string]*rsa.PublicKey {
	result := map[string]*rsa.PublicKey{}
	for key, value := range privateKeys {
		result[key] = getPublicKey(value)
	}
	return result
}

func getPublicKey(p *rsa.PrivateKey) *rsa.PublicKey {
	return &p.PublicKey
}

func getKid(p *rsa.PrivateKey) string {
	sum := md5.Sum(p.N.Bytes())
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
	token.Header["kid"] = kid

	return token.SignedString(privateKey)
}
