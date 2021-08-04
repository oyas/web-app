import { ApolloProvider } from "@apollo/client";
import { AuthorizedApolloClient } from "./client";
import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";


export function Auth0AuthorizedApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const getAccessToken = async () => {
      const domain = "oyas.jp.auth0.com";

      console.log("MyApolloProvider useEffect called", user);

      try {
        const accessToken = await getAccessTokenSilently({
          audience: "https://localhost:4000/graphql",
          scope: "read:messages",
        });

        setAccessToken(accessToken);
      } catch (e) {
        console.log(e.message);
      }
    };

    getAccessToken();
  }, [user]);

  const client = AuthorizedApolloClient(accessToken);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
