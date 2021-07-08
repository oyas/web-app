import React from "react";
import type { AppProps } from "next/app";
import Container from "@material-ui/core/Container";
import WebAppBar from "../components/WebAppBar";
import GlobalWraps from "../components/GlobalWraps";

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, []);

  return (
    <GlobalWraps>
      <WebAppBar />
      <Container maxWidth="sm">
        <Component {...pageProps} />
      </Container>
    </GlobalWraps>
  );
}

export default MyApp;
