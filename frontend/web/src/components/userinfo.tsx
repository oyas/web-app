import { useAuth0 } from "@auth0/auth0-react";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

const Profile = (props: { showMetadata?: boolean; }) => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [userMetadata, setUserMetadata] = useState<any>(null);

  const userId = user?.sub

  console.log(user);

  useEffect(() => {
    const getUserMetadata = async () => {
      const domain = "oyas.jp.auth0.com";

      console.log("useEffect called!!", user);

      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: "read:current_user",
        });

        if (userId == null) {
          return;
        }
        // const userDetailsByIdUrl = `https://${domain}/api/v2/users/${userId}`;
        const userDetailsByIdUrl = `https://${domain}/userinfo`;

        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("response:", metadataResponse);
        const data = await metadataResponse.json();
        const { user_metadata } = data;
        console.log("response json:", data);

        setUserMetadata(data);
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        } else {
          console.log(e);
        }
      }
    };

    getUserMetadata();
  }, [userId]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  let userInfoTable = userMetadata ? (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(userMetadata).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              <TableCell>
                {typeof value == "string" ? value : JSON.stringify(value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography>No user metadata defined</Typography>
  );

  return (
    (isAuthenticated && user != undefined && (
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Image
            src={user.picture || ""}
            alt={user.name || ""}
            width={100}
            height={100}
          />
        </Grid>
        <Grid item xs={9}>
          <Typography variant="h4">{user.name}</Typography>
          <Typography>{user.email}</Typography>
        </Grid>
        {props.showMetadata && userInfoTable}
      </Grid>
    )) ||
    null
  );
};

export default Profile;