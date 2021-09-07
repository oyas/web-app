import { useAuth0 } from "@auth0/auth0-react";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import React from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";

const WebAppBar = () => {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();
  const returnTo = (typeof window !== "undefined" && window.location.origin) || ""

  const [state, setState] = React.useState(false);

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState(open);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
        >
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
      <Drawer anchor="left" open={state} onClose={toggleDrawer(false)}>
        <Box onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List style={{ width: 250 }}>
            <Link href="/user" style={{ textDecoration: "none" }}>
              <ListItem button onClick={toggleDrawer(false)}>
                <ListItemText>user info</ListItemText>
              </ListItem>
            </Link>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default WebAppBar;