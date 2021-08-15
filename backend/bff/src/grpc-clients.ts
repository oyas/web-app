import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { GrpcInstrumentation } from "@opentelemetry/instrumentation-grpc";
// should be executed before import @grpc/grpc-js
registerInstrumentations({
  instrumentations: [new GrpcInstrumentation()],
});

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType as ArticlesProtoGrpcType } from "./generated/protos/articles";
import { ArticlesClient } from "./generated/protos/articles/Articles";
import { ProtoGrpcType as AuthProtoGrpcType } from "./generated/protos/auth";
import { AuthClient } from "./generated/protos/auth/Auth";
import { promisify } from "util";
import { GetRequest } from "./generated/protos/articles/GetRequest";
import { GetResponse } from "./generated/protos/articles/GetResponse";
import { ExchangeRequest } from "./generated/protos/auth/ExchangeRequest";
import { ExchangeResponse } from "./generated/protos/auth/ExchangeResponse";

const ARTICLES_PROTO_PATH = __dirname + "/../../protos/articles/articles.proto";
const AUTH_PROTO_PATH = __dirname + "/../../protos/auth/auth.proto";

export type Urls = {
  articles: string;
  auth: string;
}

export type Clients = {
  articles: ArticlesClient;
  auth: AuthClientPromisify;
};

export interface ArticlesClientPromisify {
  Get(argument: GetRequest, metadata: grpc.Metadata, options: grpc.CallOptions): Promise<GetResponse | undefined>;
}

export interface AuthClientPromisify {
  Exchange(argument: ExchangeRequest, metadata: grpc.Metadata, options: grpc.CallOptions): Promise<ExchangeResponse | undefined>;
}

// setup gRPC client
export function makeGrpcClients(urls: Urls): Clients {
  console.log("urls: ", urls);
  const articles = articlesClient(urls.articles);
  const auth = authClient(urls.auth);
  return {
    articles: articles,
    auth: {
      Exchange: promisify3<ExchangeRequest, ExchangeResponse>(auth.Exchange).bind(auth)
    },
  };
}

export function promisify3<T, TResult>(
  method: (
    argument: T,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: (error?: grpc.ServiceError, result?: TResult) => void
  ) => grpc.ClientUnaryCall
): (argument: T, metadata: grpc.Metadata, options: grpc.CallOptions) => Promise<TResult | undefined> {
  return promisify<T, grpc.Metadata, grpc.CallOptions, TResult | undefined>(method);
}

function articlesClient(url: string): ArticlesClient {
  const articles_package_definition = protoLoader.loadSync(
    ARTICLES_PROTO_PATH,
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }
  );
  const articles_proto = (
    grpc.loadPackageDefinition(
      articles_package_definition
    ) as unknown as ArticlesProtoGrpcType
  ).articles;
  return new articles_proto.Articles(
    url,
    grpc.credentials.createInsecure()
  );
}

function authClient(url: string): AuthClient {
  const auth_package_definition = protoLoader.loadSync(
    AUTH_PROTO_PATH,
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }
  );
  const auth_proto = (
    grpc.loadPackageDefinition(
      auth_package_definition
    ) as unknown as AuthProtoGrpcType
  ).auth;
  return new auth_proto.Auth(
    url,
    grpc.credentials.createInsecure()
  );
}

export function metadata(token: string): grpc.Metadata {
  var md = new grpc.Metadata();
  md.add('authorization', 'Bearer ' + token);
  return md;
}
