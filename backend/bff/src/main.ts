import fs from "fs";
import { ApolloServer } from "apollo-server";
import { setUpTracer } from "./tracer";
import { makeGrpcClients } from "./grpc-clients";
import { makeResolvers } from "./resolvers";
import { makeContext } from "./context";


const SCHEMA_GRAPHQL_PATH = __dirname + "/../schema.graphql";

const API_URL_ARTICLES = process.env.API_URL_ARTICLES || "localhost:50052";
const API_URL_AUTH = process.env.API_URL_AUTH || "localhost:50054";
const APP_JAEGER_URL = process.env.APP_JAEGER_URL || "http://localhost:14268";

// set up OpenTelemetry Tracer
const tracer = setUpTracer(APP_JAEGER_URL, "bff");

// set up gRPC clients
const clients = makeGrpcClients({
  articles: API_URL_ARTICLES,
  auth: API_URL_AUTH,
});

// set up GraphQL server
const typeDefs = fs.readFileSync(SCHEMA_GRAPHQL_PATH, { encoding: "utf8" });
const resolvers = makeResolvers(tracer, clients);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
    const token = req.headers.authorization || '';
    return await makeContext(token, clients);
  },
});

// The `listen` method launches a web server.
server.listen().then(({ url }: { url: String }) => {
  console.log(`🚀  Server ready at ${url}`);
});
