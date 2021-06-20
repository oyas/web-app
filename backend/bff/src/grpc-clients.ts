import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { GrpcInstrumentation } from "@opentelemetry/instrumentation-grpc";
// should be executed before import @grpc/grpc-js
registerInstrumentations({
  instrumentations: [new GrpcInstrumentation()],
});

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from "./generated/protos/articles";
import { ArticlesClient } from "./generated/protos/articles/Articles";

const ARTICLES_PROTO_PATH = __dirname + "/../../protos/articles/articles.proto";

export type Urls = {
  articles: string;
}

export type Clients = {
  articles: ArticlesClient;
};

// setup gRPC client
export function makeGrpcClients(urls: Urls): Clients {
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
    ) as unknown as ProtoGrpcType
  ).articles;
  const articles = new articles_proto.Articles(
    urls.articles,
    grpc.credentials.createInsecure()
  );
  return { articles };
}
