import fetch from 'cross-fetch';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';


const URL_BFF = process.env.API_URL_BFF_RUNTIME || ''

export const client = new ApolloClient({
  link: new HttpLink({
    uri: `${URL_BFF}/graphql`,
    fetch,
  }),
  cache: new InMemoryCache()
});
