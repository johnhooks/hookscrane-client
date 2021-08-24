import type { Dispatch, SetStateAction } from "react";

import { useState, useEffect } from "react";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { subMinutes } from "date-fns";
import { isDate } from "lodash-es";

import type { Maybe, AccessToken } from "lib/interfaces";

import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "lib/constants";

type useRefreshTokenResult = [boolean, Error?];

const { fetch } = fetchPonyfill();
const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

export function useRefreshToken(
  accessToken: Maybe<AccessToken>,
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>
): useRefreshTokenResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  async function fetchToken() {
    try {
      const response = await fetch(`${ENDPOINT}/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({}),
      });

      if (response.status === 200) {
        const { token, tokenExpires } = await response.json();
        setAccessToken({ token, tokenExpires: new Date(tokenExpires) });
        setLoading(false);
      } else {
        setError(new Error(response.statusText));
        setLoading(false);
      }
    } catch (error) {
      setError(error as Error);
      setLoading(false);
    }
  }

  /**
   * Fetch initial accessToken if one was not provided and the cookie
   * refreshTokenExpires seems valid.
   */
  useEffect(() => {
    if (accessToken && accessToken.tokenExpires < new Date()) {
      setLoading(false);
      return;
    }

    const cookies = cookie.parse(document.cookie);
    const refreshTokenExpires: Maybe<string> = cookies.refreshTokenExpires;

    if (!refreshTokenExpires) {
      setLoading(false);
      return;
    }

    const expires = new Date(refreshTokenExpires);

    if (!isDate(expires) || expires < new Date()) {
      setLoading(false);
      return;
    }

    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Initialize an interval to refresh the access token.
   */
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(async () => {
      if (accessToken) {
        console.log(
          "Token expires in ",
          Math.floor((subMinutes(accessToken.tokenExpires, 2).valueOf() - new Date().valueOf()) / 1000),
          " seconds"
        );
        // If the access token is about to expire, initialize a refresh.
        if (subMinutes(accessToken.tokenExpires, 2) <= new Date()) {
          fetchToken();
        }
      }
    }, 10_000);

    return () => {
      console.log("cleaning up interval");
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (typeof window === "undefined") return [false]; // if SSR

  return [loading, error];
}
