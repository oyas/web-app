import jwt, {
  GetPublicKeyOrSecret,
  JsonWebTokenError,
  JwtHeader,
  JwtPayload,
  Secret,
  SigningKeyCallback,
  VerifyOptions,
} from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { promisify } from "util";

const client = jwksClient({
  jwksUri: "https://oyas.jp.auth0.com/.well-known/jwks.json",
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (header.alg != key.alg) {
      callback(
        new JsonWebTokenError(`jwt alg invalid. expected: ${key.alg}`),
        undefined
      );
    }
    var signingKey = key.getPublicKey(); // || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

type verifyFuncType = (
  token: string,
  secretOrPublicKey: Secret | GetPublicKeyOrSecret,
  options?: VerifyOptions
) => JwtPayload;
const promisifiedJwtVerify = <verifyFuncType>promisify(jwt.verify);

export async function verifyToken(
  webAccessToken: string
): Promise<JwtPayload | undefined> {
  console.log("accessToken:", webAccessToken);
  if (!webAccessToken) {
    console.log("verify skipped");
    return undefined;
  }

  let user: JwtPayload;
  try {
    user = await promisifiedJwtVerify(webAccessToken, getKey, {
      algorithms: ["RS256"],
      audience: "https://localhost:4000/graphql",
    });
    console.log("verify successed: ", user);
  } catch (e) {
    console.log("verify failed:", e);
    return undefined;
  }

  return user;
}
