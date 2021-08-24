import type { Dispatch, SetStateAction } from "react";
import React, { useState, useEffect, useContext, createContext } from "react";
import { useApolloClient } from "@apollo/client";

import type { Maybe, AccessToken } from "lib/interfaces";
import { useRefreshToken } from "lib/auth";
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
  login: (user: User, accessToken: AccessToken) => void;
  logout: () => void;
}

// https://fettblog.eu/typescript-react/context/
const AuthContext = createContext<Partial<Context>>({});

export const useAuth = (): Partial<Context> => useContext(AuthContext);

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
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (user: User, accessToken: AccessToken): void => {
    setUser(user);
    setAccessToken(accessToken);
    console.log(`Successfully logged in as ${user.email}`, "info");
  };

  const logout = (): void => {
    fetch(`http://dev.localhost:5000/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({}),
    })
      .then(() => {
        setUser(null);
        setAccessToken(null);
        window.localStorage.setItem("logoutSync", new Date().toISOString());
        console.log(`Successfully logged out`, "info");
      })
      .catch(error => console.log(error.message));
  };

  return <AuthContext.Provider value={{ loading, user, setUser, login, logout }}>{children}</AuthContext.Provider>;
};
