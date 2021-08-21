import "styles/globals.css";
import React, { useState } from "react";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";

import type { Maybe, AccessToken } from "lib/interfaces";
import { useApollo } from "lib/apollo-client";
import Layout from "components/layout";

function MyApp({ Component, pageProps }: AppProps) {
  const [accessToken, setAccessToken] = useState<Maybe<AccessToken>>(null);
  const apolloClient = useApollo(pageProps.initialApolloState, accessToken);

  return (
    <ApolloProvider client={apolloClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ApolloProvider>
  );
}
export default MyApp;
