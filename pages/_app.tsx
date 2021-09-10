import "styles/globals.css";
import { useCallback, useEffect } from "react";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { useMachine } from "@xstate/react";

import { AuthProvider } from "contexts/auth-context";
import type { Maybe } from "lib/interfaces";
import type { AccessToken } from "lib/access-token";
import { useApollo } from "lib/apollo-client";
import { tokenMachine } from "lib/token-machine";
import Layout from "components/layout";

function MyApp({ Component, pageProps }: AppProps) {
  const [state, send] = useMachine(tokenMachine);
  const apolloClient = useApollo(pageProps, state.context.token);

  useEffect(() => {
    send("FETCH");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendLoginEvent = useCallback(
    (token: AccessToken) => {
      send("LOGIN", { token });
    },
    [send]
  );

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider accessToken={state.context.token} onLogin={sendLoginEvent}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ApolloProvider>
  );
}
export default MyApp;
