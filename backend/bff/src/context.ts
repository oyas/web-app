import { JwtPayload } from "jsonwebtoken";
import { Clients, metadata } from "./grpc-clients";
import { verifyToken } from "./verifyToken";

export type ContextType = {
  user: JwtPayload | undefined;
  webAccessToken: string;
  getExchangedToken: () => Promise<string | undefined>;
};

export async function makeContext(
  accessToken: string,
  clients: Clients
): Promise<ContextType> {
  let token: string | undefined = undefined;
  let user = await verifyToken(accessToken);
  let getExchangedToken = async () => {
    token ??= await exchangeToken(accessToken, clients) ?? "";
    return token;
  };
  return { user, webAccessToken: accessToken, getExchangedToken };
}

async function exchangeToken(
  accessToken: string,
  clients: Clients
): Promise<string | undefined> {
  let md = metadata(accessToken);
  const result = await clients.auth.Exchange({}, md, {}).catch((err: any) => {
    console.log(err);
  });
  console.log("[query auth] gRPC result:", result);
  return result?.token;
}
