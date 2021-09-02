import type { Dispatch, SetStateAction } from "react";

import { useEffect, useState } from "react";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { formatDistance, subMinutes } from "date-fns";

import type { Maybe, AccessToken } from "lib/interfaces";

import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "lib/constants";
import { fetchWithRetry } from "lib/fetch-with-retry";
import { logger } from "lib/logger";

const { fetch } = fetchPonyfill();
const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

/**
 * Initialize an interval to refresh the authentication tokens.
 */
export function useRefreshToken(
  accessToken: Maybe<AccessToken>,
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>
): boolean {
  /**
   * This hook only needs browser functionality, all queries that are performed on the server require
   * `fetchAccessToken`, which will use the api server /refresh route to get a new access token.
   *
   * The `refreshToken` itself is httpOnly and cannot be accessed from the browser.
   * To indicate if we may have a valid `refreshToken`, the cookie `refreshTokenExpires`
   * is set as a non httpOnly cookie. It is also unsigned. If multiple checks pass,
   * attempt to fetch a new access token from the api server.
   *
   * TODO need to pass a destroySession rather than setAccessToken, or return an error in order the
   * AuthContext to know when to clean up an invalid session.
   */

  const [loading, setLoading] = useState(true);

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

    // There is already a try catch inside refreshTokens
    refreshTokens().then(token => {
      setAccessToken(token);
      setLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Initialize an interval to refresh the access token.
   * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
   */
  useEffect(() => {
    // If there isn't an accessToken no need to schedule a refresh.
    if (!accessToken) return;

    logger.debug("[Auth] Initializing refresh token interval");
    let interval: NodeJS.Timer | null = setInterval(tick, 60_000);

    function tick() {
      if (accessToken) {
        logger.debug(`[Auth] The accessToken expires in ${formatDistance(accessToken.tokenExpires, new Date())}`);
        if (shouldRefresh(accessToken)) {
          setLoading(true);
          refreshTokens().then(token => {
            setAccessToken(token);
            setLoading(false);
          });
        }
      } else {
        cleanup();
      }
    }

    function cleanup() {
      if (interval) {
        logger.debug("[Auth] Cleaning up refresh token interval");
        clearInterval(interval);
        interval = null;
      }
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Always return loading false in SSR
  if (typeof window === "undefined") return false;

  return loading;
}

/**
 * Return whether or not the accessToken should be refreshed.
 */
function shouldRefresh(accessToken: AccessToken): boolean {
  // Does it expire less than two minutes from now?
  return subMinutes(accessToken.tokenExpires, 2) <= new Date();
}

async function refreshTokens(): Promise<Maybe<AccessToken>> {
  try {
    logger.debug("[Auth] Requesting token refresh");

    const response = await fetchWithRetry({
      count: 3,
      timeout: 500,
      input: `${ENDPOINT}/refresh`,
      init: {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({}),
      },
    });

    if (response.status === 200) {
      const { token, tokenExpires } = await response.json();
      logger.debug("[Auth] Successfully refreshed tokens");
      return { token, tokenExpires: new Date(tokenExpires) };
    } else {
      logger.debug(`[Auth] Failed to refresh tokens\nstatusCode: ${response.status}\nstatusText: ${response.statusText}`); // prettier-ignore
      return null;
    }
  } catch (error) {
    logger.debug("[Auth] Failed to refresh tokens", error);
    return null;
  }
}
