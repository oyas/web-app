import Head from 'next/head'
import Profile from "../components/userinfo";

export default function User() {
  return (
    <>
      <Head>
        <title>User</title>
        <meta name="description" content="user information" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Profile showMetadata/>
      </main>
    </>
  );
};
