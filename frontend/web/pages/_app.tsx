import React from "react";
import type { AppProps } from "next/app";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import WebAppBar from "../components/WebAppBar";
import GlobalWraps from "../components/GlobalWraps";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GlobalWraps>
      <CssBaseline />
      <WebAppBar />
      <Container maxWidth="sm">
        <Component {...pageProps} />
      </Container>
    </GlobalWraps>
  );
}

export default MyApp;
