import { useEffect, useMemo } from "react";
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink, NormalizedCacheObject, Operation } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import merge from "deepmerge";
import { isEqual } from "lodash-es";

import type { Maybe } from "./interfaces";
import type { AccessToken } from "./access-token";
import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

const isSSR = typeof window === "undefined";

let apolloClient: Maybe<ApolloClient<NormalizedCacheObject>> = null;
let inMemoryAccessToken: Maybe<AccessToken> = null;

function createIsomorphLink() {
  if (isSSR) {
    // Could possibly use a schema link, if I can combine api and client code...
    return new HttpLink({
      uri: `${LOCAL_API_ENDPOINT}/graphql`,
      credentials: "include",
    });
  } else {
    return new HttpLink({
      uri: `${API_ENDPOINT}/graphql`,
      credentials: "include",
    });
  }
}

function setAuthHeader(operation: Operation, accessToken: AccessToken): void {
  operation.setContext({
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
    },
  });
}

const authMiddleware = (accessToken: Maybe<AccessToken>) =>
  new ApolloLink((operation, forward) => {
    if (isSSR) {
      if (accessToken) {
        setAuthHeader(operation, accessToken);
      }
    } else if (inMemoryAccessToken) {
      setAuthHeader(operation, inMemoryAccessToken);
    }
    return forward(operation);
  });

function createApolloClient(accessToken: Maybe<AccessToken>) {
  return new ApolloClient({
    ssrMode: isSSR,
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
          );
        if (networkError) console.log(`[Network error]: ${networkError}. Backend is unreachable. Is it running?`);
      }),
      authMiddleware(accessToken),
      createIsomorphLink(),
    ]),
    cache: new InMemoryCache(),
  });
}

// Inspired by https://github.com/vercel/next.js/blob/canary/examples/with-apollo/lib/apolloClient.js
export function initializeApollo(initialState: any = null, accessToken: Maybe<AccessToken> = null) {
  // Use the existing client or create a new one
  const _apolloClient = apolloClient ?? createApolloClient(accessToken);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter(d => sourceArray.every(s => !isEqual(d, s))),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (isSSR) return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client: ApolloClient<NormalizedCacheObject>, pageProps: any = { props: {} }) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }
  return pageProps;
}

/**
 * useApollo React Hook
 * Uses a memo to only return a new client if the `initialState` or `accessToken` change.
 * @param initialState
 */
export function useApollo(pageProps: any, accessToken: Maybe<AccessToken>) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];

  // Putting this in a useEffect didn't work, it was delayed. The accessToken would change but not
  // here before it was valid in the AuthContext, so the MeQuery would fail as Not Authorized.
  if (!isSSR) {
    // In browser always update the in memory access token to its current value
    inMemoryAccessToken = accessToken;
  }

  const store = useMemo(() => initializeApollo(state), [state]);
  return store;
}
