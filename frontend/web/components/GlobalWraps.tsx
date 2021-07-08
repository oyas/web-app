import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo/client';
import { Auth0Provider } from "@auth0/auth0-react";

function GlobalWraps({ children }: { children: JSX.Element[] }) {
  return (
    <Auth0Provider
      domain="oyas.jp.auth0.com"
      clientId="JznIqZymuUpM3SdmCPZJmXPq137TL7sQ"
      redirectUri={
        (typeof window !== "undefined" && window.location.origin) || ""
      }
    >
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </Auth0Provider>
  );
}

export default GlobalWraps;