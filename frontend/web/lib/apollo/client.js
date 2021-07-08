import { ApolloClient, InMemoryCache } from "@apollo/client";

const URL_BFF = process.env.API_URL_BFF_RUNTIME || process.env.NEXT_PUBLIC_URL_BFF || "";

export const client = new ApolloClient({
  uri: `${URL_BFF}/graphql`,
  cache: new InMemoryCache(),
});
