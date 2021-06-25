import { ApolloClient, InMemoryCache } from "@apollo/client";

const URL_BFF = process.env.API_URL_BFF_RUNTIME || "http://localhost:4000";

export const client = new ApolloClient({
  uri: `${URL_BFF}/graphql`,
  cache: new InMemoryCache(),
});
