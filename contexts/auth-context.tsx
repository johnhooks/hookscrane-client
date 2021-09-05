import type { Dispatch, SetStateAction } from "react";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client";

import type { Maybe } from "lib/interfaces";

import { API_ENDPOINT } from "lib/constants";
import { logger } from "lib/logger";
import { AccessToken } from "lib/access-token";
import { forceTokenRefresh, silentTokenRefresh } from "lib/silent-token-refresh";
import { MeQuery, MeDocument, User } from "generated/types";

/**
 * TODO: Need to handle how to pause refresh of the tokens when offline.
 * [x] - Use the `online` and `offline` events on the `window`
 * [ ] - Look into using a service worker to refresh accessTokens and them to fetch requests.
 */

type Props = {
  accessToken: Maybe<AccessToken>;
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>;
  children: React.ReactNode;
};

interface Context {
  user: Maybe<User>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Just something to fool React.createContext until the provider is initialized.
function nope(...args: any[]): Promise<void> {
  return Promise.resolve();
}

// https://fettblog.eu/typescript-react/context/
const AuthContext: React.Context<Context> = createContext<Context>({ user: null, login: nope, logout: nope });
export const useAuth = (): Context => useContext(AuthContext);

export const AuthProvider: React.FunctionComponent<Props> = ({ accessToken, setAccessToken, children }) => {
  const client = useApolloClient();
  let data: Maybe<MeQuery> = null;

  // Throws an error if the query is missing.
  try {
    data = client.readQuery<MeQuery>({ query: MeDocument });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("[Auth] failed to read MeQuery from ApolloClient", error);
    }
  }

  /** NOTE: What happens if multiple tabs attempt to refresh at the same time?
   * Only one would succeed, the others should fail, and because useRefreshToken retries
   * 3 times on failure, the tabs that failed will retry and because the cookie was refreshed by
   * the previous tab it should succeed.
   *
   * What happens with lots of tabs open? It seems to work most the time, but some times it fails.
   */
  const [user, setUser] = useState<Maybe<User>>(data?.me || null); // Set user if provided through SSR

  function clearSession() {
    setAccessToken(null);
    setUser(null);

    // https://www.apollographql.com/docs/react/networking/authentication/#reset-store-on-logout
    // The most straightforward way to ensure that the UI and store state reflects the current user's
    // permissions is to call client.resetStore() after your login or logout process has completed.
    // This will cause the store to be cleared and all active queries to be refetched. If you just
    // want the store to be cleared and don't want to refetch active queries, use client.clearStore()
    // instead. Another option is to reload the page, which will have a similar effect.
    location.reload();
    console.log("[Auth] session data cleared");
  }

  function onlineEventHandler() {
    forceTokenRefresh(setAccessToken);
  }

  function storageEventHandler(event: StorageEvent): void {
    // watch localStorage in order to sync logout between tabs.
    if (event.key === "logoutSync") {
      logger.debug("[Auth] initializing synchronized logout");
      clearSession();
    }
  }

  useEffect(() => {
    logger.debug("[Util] initializing window event listeners");
    window.addEventListener("online", onlineEventHandler);
    window.addEventListener("storage", storageEventHandler);
    return function cleanup() {
      logger.debug("[Util cleaning up window event listeners");
      window.removeEventListener("online", onlineEventHandler);
      window.removeEventListener("storage", storageEventHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Initialize an interval to refresh the access token.
    const cleanup = silentTokenRefresh(accessToken, setAccessToken);
    if (cleanup) return cleanup;
  }, [accessToken, setAccessToken]);

  useEffect(() => {
    if (!accessToken || user) return;
    client
      .query<MeQuery>({ query: MeDocument, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (data?.me) {
          logger.debug("[Auth] request to fetch user account data successful");
          setUser(data.me);
        }
      })
      .catch(error => {
        throw new Error(`[Auth] request to fetch user account data failed: ${error.message}`);
      });
  }, [accessToken, client, setUser, user]);

  async function login(email: string, password: string): Promise<void> {
    if (typeof window === "undefined") {
      // throw new Error("[Auth] login function called by server");
      return;
    }

    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({ email, password }),
    });

    const body = await response.text();
    const token = AccessToken.parse(body);

    if (token) {
      setAccessToken(token);
      logger.debug("[Auth] login successful");
    } else {
      throw new Error("[Auth] login attempt failed");
    }
  }

  async function logout(): Promise<void> {
    if (typeof window === "undefined") {
      // throw new Error("[Auth] logout function called by server");
      return;
    }

    const response = await fetch(`${API_ENDPOINT}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({}),
    });

    if (response.status === 200) {
      window.localStorage.setItem("logoutSync", new Date().toISOString());
      clearSession();
    } else {
      throw new Error("[Auth] logout attempt failed");
    }
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
