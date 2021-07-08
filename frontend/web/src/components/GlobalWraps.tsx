import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo/client';
import { Auth0Provider } from "@auth0/auth0-react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../theme';

function GlobalWraps({ children }: { children: JSX.Element[] }) {
  return (
    <Auth0Provider
      domain="oyas.jp.auth0.com"
      clientId="JznIqZymuUpM3SdmCPZJmXPq137TL7sQ"
      redirectUri={
        (typeof window !== "undefined" && window.location.origin) || ""
      }
    >
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ApolloProvider>
    </Auth0Provider>
  );
}

export default GlobalWraps;