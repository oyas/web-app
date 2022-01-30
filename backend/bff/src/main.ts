import { setUpTracer } from "./tracer";
import { makeGrpcClients } from "./grpc-clients";
import { makeServer } from "./server";
import { setTimeout } from "timers/promises";

const SCHEMA_GRAPHQL_PATH = __dirname + "/../schema.graphql";

const API_URL_ARTICLES = process.env.API_URL_ARTICLES || "localhost:50052";
const API_URL_AUTH = process.env.API_URL_AUTH || "localhost:50054";
const APP_JAEGER_URL = process.env.APP_JAEGER_URL || "http://localhost:14268";

async function main(){
    // set up OpenTelemetry Tracer
    setUpTracer(APP_JAEGER_URL, "bff");

    // set up gRPC clients
    const clients = makeGrpcClients({
      articles: API_URL_ARTICLES,
      auth: API_URL_AUTH,
    });

    // set up GraphQL server
    const server = makeServer(SCHEMA_GRAPHQL_PATH, clients);

    // sleep for startup test
    console.log("sleep 30 sec...");
    await setTimeout(30000);

    // The `listen` method launches a web server.
    server.listen().then(({ url }: { url: String }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
}

main();
