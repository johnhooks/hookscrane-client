import type { Dispatch, SetStateAction } from "react";

import { useState, useEffect } from "react";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { formatDistance, subMinutes } from "date-fns";

import type { Maybe, AccessToken } from "lib/interfaces";

import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "lib/constants";
import { logger } from "lib/logger";

type useRefreshTokenResult = [boolean, Maybe<Error>];

const { fetch } = fetchPonyfill();
const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

/**
 * This hook only needs browser functionality, all queries that are performed on the server require
 * `fetchAccessToken` which will use the api server /refresh route to get a new access token, it
 * then passes the new Set-Cookie header to the client in order to allow refreshing the session.
 * The access token used for SSR will be abandoned after one use.
 *
 * The `refreshToken` itself is httpOnly and cannot be accessed from the browser.
 * To indicate if we may have a valid `refreshToken`, the cookie `refreshTokenExpires`
 * is set as a non httpOnly cookie. It is also unsigned. If multiple checks pass,
 * attempt to fetch a new access token from the api server.
 */
export function useRefreshToken(
  accessToken: Maybe<AccessToken>,
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>
): useRefreshTokenResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Maybe<Error>>(null);

  async function fetchToken() {
    try {
      setLoading(true);
      logger.debug("[Auth] Attempting to refresh tokens");

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
        logger.debug("[Auth] Tokens successfully refreshed");
        setAccessToken({ token, tokenExpires: new Date(tokenExpires) });
        setLoading(false);
      } else {
        logger.debug(`[Auth] Failed to fetch refresh tokens\nstatusCode: ${response.status}\nstatusText: ${response.statusText}`); // prettier-ignore
        setError(new Error(response.statusText));
        setLoading(false);
      }
    } catch (error) {
      logger.debug(`[Auth] Failed to fetch refresh tokens\nerror: ${error}`); // prettier-ignore
      setError(error as Error);
      setLoading(false);
    }
  }

  /**
   * Attempt to fetch an initial accessToken if one was not provided and the cookie
   * refreshTokenExpires seems valid.
   */
  useEffect(() => {
    if (accessToken && !shouldRefresh(accessToken)) {
      logger.debug("[Auth] The accessToken looks valid");
      setLoading(false);
      return;
    }

    const cookies = cookie.parse(document.cookie);
    const refreshTokenExpires: Maybe<string> = cookies.refreshTokenExpires;

    if (!refreshTokenExpires) {
      // The refreshTokenExpires cookie is either missing or expired and cleared by the browser
      logger.debug("[Auth] The refreshTokenExpires cookie is either missing or expired and cleared by the browser");
      setAccessToken(null);
      setLoading(false);
      return;
    }

    const expires = new Date(refreshTokenExpires);

    if (!(expires instanceof Date) || isNaN(expires.valueOf()) || expires < new Date()) {
      // The refreshTokenExpires cookie is either invalid or has expired
      logger.debug("[Auth] The refreshTokenExpires cookie is either invalid or has expired");
      setAccessToken(null);
      setLoading(false);
      return;
    }

    // Attempt to refresh tokens
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
        const now = new Date();
        logger.debug(`[Auth] The accessToken expires in ${formatDistance(accessToken.tokenExpires, now)}`);
        if (shouldRefresh(accessToken)) fetchToken();
      }
    }, 60_000);

    return () => {
      logger.debug("cleaning up interval");
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Always return `loading` false in SSR
  if (typeof window === "undefined") return [false, null];

  return [loading, error];
}

/**
 * Return whether or not the accessToken should be refreshed;
 */
function shouldRefresh(accessToken: AccessToken): boolean {
  return subMinutes(accessToken.tokenExpires, 2) <= new Date(); // 2 minutes less than now.
}
