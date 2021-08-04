import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  concat,
} from "@apollo/client";

const URL_BFF =
  process.env.API_URL_BFF_RUNTIME || process.env.NEXT_PUBLIC_URL_BFF || "";

export function AuthorizedApolloClient(accessToken: string) {
  const httpLink = new HttpLink({ uri: `${URL_BFF}/graphql` });

  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: accessToken,
      },
    }));

    return forward(operation);
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: concat(authMiddleware, httpLink),
  });

  return client;
}
