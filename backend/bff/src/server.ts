import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql";
// should be executed before import apollo-server
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new GraphQLInstrumentation(),
  ],
});

import fs from "fs";
import { ApolloServer } from "apollo-server";
import { makeResolvers } from "./resolvers";
import { makeContext } from "./context";
import { Clients } from "./grpc-clients";

export function makeServer(
  schemaGraphqlPath: string,
  clients: Clients
): ApolloServer {
  const typeDefs = fs.readFileSync(schemaGraphqlPath, { encoding: "utf8" });
  const resolvers = makeResolvers(clients);
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
      const token = req.headers.authorization || "";
      return await makeContext(token, clients);
    },
  });
}
