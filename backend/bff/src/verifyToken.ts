import jwt, { GetPublicKeyOrSecret, JsonWebTokenError, JwtHeader, Secret, SigningKeyCallback, VerifyOptions } from "jsonwebtoken"
import jwksClient from "jwks-rsa"
import { promisify } from "util";

const client = jwksClient({
  jwksUri: 'https://oyas.jp.auth0.com/.well-known/jwks.json'
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (header.alg != key.alg + "invalid") {
      callback(new JsonWebTokenError(`jwt alg invalid. expected: ${key.alg}`), undefined);
    }
    var signingKey = key.getPublicKey() // || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

type verifyFuncType = (
  token: string,
  secretOrPublicKey: Secret | GetPublicKeyOrSecret,
  options?: VerifyOptions
) => void;
const promisifiedJwtVerify = <verifyFuncType>promisify(jwt.verify);

export async function verifyToken(accessToken: string): Promise<any> {
  console.log("accessToken:", accessToken);
  if (!accessToken) {
    console.log("verify skipped");
    return Promise.resolve(undefined);
  }
  try {
    let decoded = await promisifiedJwtVerify(accessToken, getKey, {
      algorithms: ["RS256"],
      audience: "https://localhost:4000/graphql",
      complete: true,
    });
    console.log("verify successed: ", decoded);
    return Promise.resolve(decoded);
  } catch (e) {
    console.log("verify failed:", e);
  }
  return Promise.resolve(undefined);
};
