import { useMemo } from "react";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

import type { Maybe, AccessToken } from "./interfaces";
import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";

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
      credentials: "include",
    });
  }
}

const authMiddleware = () =>
  new ApolloLink((operation, forward) => {
    //  accessToken ||= typeof window === "object" && authTools.getAccessToken();

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
            console.log(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
          );
        if (networkError)
          console.log(
            `[Network error]: ${networkError}. Backend is unreachable. Is it running?`
          );
      }),
      authMiddleware(),
      createIsomorphLink(),
    ]),

    cache: new InMemoryCache(),
  });
}

export function initializeApollo(
  initialState: any = null,
  accessToken?: Maybe<AccessToken>
) {
  inMemoryAccessToken = accessToken || null;
  const _apolloClient =
    accessToken || !apolloClient ? createApolloClient() : apolloClient;

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();
    // Restore the cache using the data passed from getStaticProps/getServerSideProps
    // combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

const client = new ApolloClient({
  ssrMode: typeof window === "undefined",

  uri: API_ENDPOINT,
  cache: new InMemoryCache(),
});

/**
 * useApollo React Hook
 * Uses a memo to only return a new client if the `initialState` or `accessToken` change.
 * @param initialState
 */
export function useApollo(initialState: any, accessToken: Maybe<AccessToken>) {
  const store = useMemo(
    () => initializeApollo(initialState, accessToken),
    [initialState, accessToken]
  );
  return store;
}

export default client;
