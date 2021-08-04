import { Auth0Provider } from "@auth0/auth0-react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../theme';
import { Auth0AuthorizedApolloProvider } from "../lib/apollo/Auth0AuthorizedApolloProvider";

function GlobalWraps({ children }: { children: JSX.Element[] }) {
  return (
    <Auth0Provider
      domain="oyas.jp.auth0.com"
      clientId="JznIqZymuUpM3SdmCPZJmXPq137TL7sQ"
      redirectUri={
        (typeof window !== "undefined" && window.location.origin) || ""
      }
      audience="https://localhost:4000/graphql"
      scope="read:messages"
    >
      <Auth0AuthorizedApolloProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Auth0AuthorizedApolloProvider>
    </Auth0Provider>
  );
}

export default GlobalWraps;