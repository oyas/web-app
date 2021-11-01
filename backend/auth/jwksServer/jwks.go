package jwksserver

import (
	"auth/sign"
	"encoding/base64"
	"math/big"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"common/auth"
)

func StartEchoServer() {
	jwks := makeJwks()
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.GET("/jwks.json", func(c echo.Context) error {
		return c.JSON(http.StatusOK, jwks)
	})
	e.Logger.Fatal(e.Start(":3000"))
}

func makeJwks() auth.Jwks {
	publicKey := sign.GetPublicKey()
	n := base64.RawURLEncoding.EncodeToString(publicKey.N.Bytes())
	e := base64.RawURLEncoding.EncodeToString(big.NewInt(int64(publicKey.E)).Bytes())
	return auth.Jwks{
		Keys: []auth.JSONWebKeys{
			{
				Kty: "RSA",
				Alg: "RS256",
				Kid: sign.GetKid(),
				Use: "sig",
				N:   n,
				E:   e,
				X5c: nil,
			},
		},
	}
}