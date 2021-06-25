/* import '../styles/globals.css' */
import type { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo/client';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Link from '@material-ui/core/Link';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            <Link href="/" color="inherit" style={{ textDecoration: 'none' }}>
              web-app
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <ApolloProvider client={client}>
        <Container maxWidth="sm">
          <Component {...pageProps} />
        </Container>
      </ApolloProvider>
    </>
  );
}
export default MyApp
