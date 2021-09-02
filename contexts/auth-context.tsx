import type { Dispatch, SetStateAction } from "react";

import React, { useState, useEffect, useContext, createContext } from "react";
import { useApolloClient } from "@apollo/client";
import { isObject, isString } from "lodash-es";

import type { Maybe, AccessToken } from "lib/interfaces";

import { logger } from "lib/logger";
import { useRefreshToken } from "hooks/use-refresh-token";
import { API_ENDPOINT } from "lib/constants";
import { MeQuery, MeDocument, User } from "generated/types";

type Props = {
  accessToken: Maybe<AccessToken>;
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>;
  children: React.ReactNode;
};

interface Context {
  user: Maybe<User>;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// https://fettblog.eu/typescript-react/context/
let AuthContext: React.Context<Context>;

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
  const loading = useRefreshToken(accessToken, setAccessToken);
  const [user, setUser] = useState<Maybe<User>>(data?.me || null); // Set user if provided through SSR

  // Initialize watching localStorage in order to sync logout between tabs.
  useEffect(() => {
    window.addEventListener("storage", syncLogout);
    return function cleanup() {
      window.removeEventListener("storage", syncLogout);
    };
  });

  useEffect(() => {
    // Token refresh must have failed and we still have user data in the browser.
    if (!loading && !accessToken && user) return clearSessionData();

    if (!accessToken || user) return;

    client
      .query<MeQuery>({ query: MeDocument, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (data?.me) setUser(data.me);
      })
      .catch(error => {
        throw new Error(`User data request failed: ${error.message}`);
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

    const data = await response.json();

    if (isAccessTokenPayload(data)) {
      setAccessToken({ token: data.token, tokenExpires: new Date(data.tokenExpires) });
      logger.debug(`[Auth] Successfully logged in`);
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
      clearSessionData();
    } else {
      throw new Error("[Auth] Failed logout attempt");
    }
  }

  function syncLogout(event: StorageEvent): void {
    if (event.key === "logoutSync") {
      logger.debug("[Auth] Synced logout");
      clearSessionData();
    }
  }

  function clearSessionData() {
    setUser(null);
    setAccessToken(null);
    // https://www.apollographql.com/docs/react/networking/authentication/#reset-store-on-logout
    // The most straightforward way to ensure that the UI and store state reflects the current user's
    // permissions is to call client.resetStore() after your login or logout process has completed.
    // This will cause the store to be cleared and all active queries to be refetched. If you just
    // want the store to be cleared and don't want to refetch active queries, use client.clearStore()
    // instead. Another option is to reload the page, which will have a similar effect.
    location.reload();
    console.log("[Auth] Successfully cleared session data");
  }

  AuthContext = createContext<Context>({ user, setUser, login, logout });

  return <AuthContext.Provider value={{ user, setUser, login, logout }}>{children}</AuthContext.Provider>;
};

function isAccessTokenPayload(value: unknown): value is { token: string; tokenExpires: string } {
  return (
    isObject(value) &&
    isString((value as unknown as AccessToken).token) &&
    isString((value as unknown as AccessToken).tokenExpires)
  );
}
