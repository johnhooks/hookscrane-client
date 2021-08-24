import type { AppProps } from "next/app";

import { useMemo } from "react";
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink, NormalizedCacheObject } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import merge from "deepmerge";
import { isEqual } from "lodash-es";

import type { Maybe, AccessToken } from "./interfaces";
import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;
let inMemoryAccessToken: Maybe<AccessToken>;

function createIsomorphLink() {
  if (typeof window === "undefined") {
    return new HttpLink({
      uri: `${LOCAL_API_ENDPOINT}/graphql`, // Will use a different uri in production on server
      credentials: "include",
    });
  } else {
    return new HttpLink({
      uri: `${API_ENDPOINT}/graphql`,
      credentials: "same-origin",
    });
  }
}

const authMiddleware = () =>
  new ApolloLink((operation, forward) => {
    if (inMemoryAccessToken) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${inMemoryAccessToken.jwt}`,
        },
      });
    }

    return forward(operation);
  });

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: ApolloLink.from([
      onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
          );
        if (networkError) console.log(`[Network error]: ${networkError}. Backend is unreachable. Is it running?`);
      }),
      authMiddleware(),
      createIsomorphLink(),
    ]),
    cache: new InMemoryCache(),
  });
}

// From https://github.com/vercel/next.js/blob/canary/examples/with-apollo/lib/apolloClient.js
export function initializeApollo(initialState: any = null, accessToken?: Maybe<AccessToken>) {
  inMemoryAccessToken = accessToken ?? null;
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
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
  if (typeof window === "undefined") return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client: ApolloClient<NormalizedCacheObject>, pageProps: any) {
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
  const store = useMemo(() => initializeApollo(state, accessToken), [state, accessToken]);
  return store;
}
