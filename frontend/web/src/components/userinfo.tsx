import { useAuth0 } from "@auth0/auth0-react";
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Image from 'next/image'

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    (isAuthenticated && user != undefined && (
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Image src={user.picture || ""} alt={user.name || ""} width={100} height={100} />
        </Grid>
        <Grid item xs={9}>
          <Typography variant="h4">{user.name}</Typography>
          <Typography>{user.email}</Typography>
        </Grid>
      </Grid>
    )) ||
    null
  );
};

export default Profile;