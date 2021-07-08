import { useAuth0 } from "@auth0/auth0-react";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

const WebAppBar = () => {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();
  const returnTo = (typeof window !== "undefined" && window.location.origin) || ""

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h6">
            <Link href="/" color="inherit" style={{ textDecoration: "none" }}>
              web-app
            </Link>
          </Typography>
        </Box>
        {!isAuthenticated && (
          <Button variant="contained" onClick={() => loginWithRedirect()}>
            Log In
          </Button>
        )}
        {isAuthenticated && (
          <Button variant="contained" onClick={() => logout({ returnTo })}>
            Log Out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default WebAppBar;