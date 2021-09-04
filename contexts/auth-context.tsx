import type { Dispatch, SetStateAction } from "react";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client";

import type { Maybe } from "lib/interfaces";

import { API_ENDPOINT } from "lib/constants";
import { logger } from "lib/logger";
import { AccessToken } from "lib/access-token";
import { useRefreshToken, Status as RefreshStatus } from "hooks/use-refresh-token";

import { MeQuery, MeDocument, User } from "generated/types";

/**
 * TODO: Need to handle how to pause refresh of the tokens when offline.
 * [ ] - Use the `online` and `offline` events on the `window`
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
      logger.error("[Auth] Unable to read MeQuery", error);
    }
  }

  /** NOTE: What happens if multiple tabs attempt to refresh at the same time?
   * Only one would succeed, the others should fail, and because useRefreshToken retries
   * 3 times on failure, the tabs that failed will retry and because the cookie was refreshed by
   * the previous tab it should succeed.
   *
   * What happens with lots of tabs open? It seems to work most the time, but some times it fails.
   */
  const [refreshStatus, forceRefresh] = useRefreshToken(accessToken, setAccessToken);
  const [user, setUser] = useState<Maybe<User>>(data?.me || null); // Set user if provided through SSR
  const refreshStatusRef = useRef(refreshStatus);

  refreshStatusRef.current = refreshStatus;

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
    console.log("[Auth] Successfully cleared session data");
  }

  function online() {
    if (refreshStatusRef.current !== RefreshStatus.Fetching && AccessToken.validRefreshTokenExpires()) {
      logger.debug("[Auth] Forcing token refresh after coming back online");
      forceRefresh();
    }
  }

  function syncLogout(event: StorageEvent): void {
    if (event.key === "logoutSync") {
      logger.debug("[Auth] Syncing logout");
      clearSession();
    }
  }

  // Initialize watching localStorage in order to sync logout between tabs.
  useEffect(() => {
    logger.debug("[Util] Initializing online callback");
    window.addEventListener("online", online);
    window.addEventListener("storage", syncLogout);
    return function cleanup() {
      logger.debug("[Util Cleaning up online ");
      window.removeEventListener("online", online);
      window.removeEventListener("storage", syncLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accessToken || user) return;

    client
      .query<MeQuery>({ query: MeDocument, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (data?.me) setUser(data.me);
      })
      .catch(error => {
        // throw new Error(`User data request failed: ${error.message}`);
        console.error(`User data request failed: ${error.message}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function login(email: string, password: string): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("The AuthContext login function should never to be called by the server");
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
      logger.debug("[Auth] Successfully logged in");
    } else {
      throw new Error("[Auth] Failed login attempt");
    }
  }

  async function logout(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("[Auth] The AuthContext logout function should never to be called by the server");
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
      throw new Error("[Auth] Failed logout attempt");
    }
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
