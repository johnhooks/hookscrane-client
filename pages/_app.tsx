import "styles/globals.css";
import React, { useState } from "react";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import { AuthProvider } from "contexts/auth-context";
import type { Maybe } from "lib/interfaces";
import type { AccessToken } from "lib/access-token";
import { useApollo } from "lib/apollo-client";
import Layout from "components/layout";

function MyApp({ Component, pageProps }: AppProps) {
  const [accessToken, setAccessToken] = useState<Maybe<AccessToken>>(null);
  const apolloClient = useApollo(pageProps, accessToken);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider accessToken={accessToken} setAccessToken={setAccessToken}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ApolloProvider>
  );
}
export default MyApp;
