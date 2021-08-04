import { useAuth0 } from "@auth0/auth0-react";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Image from 'next/image'
import React, { useEffect, useState } from "react";

const Profile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [userMetadata, setUserMetadata] = useState(null);

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
        console.log(e.message);
      }
    };

    getUserMetadata();
  }, [userId]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

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
          <Typography variant="h5">User Metadata</Typography>
          {userMetadata ? (
            <pre>{JSON.stringify(userMetadata, null, 2)}</pre>
          ) : (
            "No user metadata defined"
          )}
        </Grid>
      </Grid>
    )) ||
    null
  );
};

export default Profile;