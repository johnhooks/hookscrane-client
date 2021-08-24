import type { Dispatch, SetStateAction } from "react";
import React, { useState, useEffect, useContext, createContext } from "react";
import { useApolloClient } from "@apollo/client";
import { isObject, isString, isDate } from "lodash-es";
import type { Maybe, AccessToken } from "lib/interfaces";
import { useRefreshToken } from "lib/auth";
import { API_ENDPOINT } from "lib/constants";
import { MeQuery, MeDocument, User } from "generated/types";

type Props = {
  accessToken: Maybe<AccessToken>;
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>;
  children: React.ReactNode;
};

interface Context {
  loading: boolean;
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
      console.log(error.message);
    }
  }

  const [loading] = useRefreshToken(accessToken, setAccessToken);
  const [user, setUser] = useState<Maybe<User>>(data?.me || null); // Set user if provided through SSR

  useEffect(() => {
    if (!accessToken || user) return;

    client
      .query<MeQuery>({ query: MeDocument, fetchPolicy: "network-only" })
      .then(({ data }) => {
        if (data?.me) setUser(data.me);
      })
      .catch(error => console.log(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const login = async (email: string, password: string): Promise<void> => {
    if (typeof window === "undefined") {
      throw new Error("The AuthContext login function should never to be called by server.");
    }
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log(data);
    if (isAccessTokenPayload(data)) {
      setAccessToken({ token: data.token, tokenExpires: new Date(data.tokenExpires) });
      console.log(`Successfully logged in`, "info");
    } else {
      throw new Error("Failed login attempt");
    }
  };

  const logout = async (): Promise<void> => {
    if (typeof window === "undefined") {
      throw new Error("The AuthContext logout function should never to be called by server.");
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
      setUser(null);
      setAccessToken(null);
      window.localStorage.setItem("logoutSync", new Date().toISOString());
      console.log(`Successfully logged out`, "info");
    } else {
      throw new Error("Failed logout attempt");
    }
  };

  AuthContext = createContext<Context>({ loading, user, setUser, login, logout });
  return <AuthContext.Provider value={{ loading, user, setUser, login, logout }}>{children}</AuthContext.Provider>;
};

export function isAccessTokenPayload(value: unknown): value is { token: string; tokenExpires: string } {
  return (
    isObject(value) &&
    typeof (value as unknown as AccessToken)?.token === "string" &&
    typeof (value as unknown as AccessToken)?.tokenExpires === "string"
  );
}
