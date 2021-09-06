import type { Dispatch, SetStateAction } from "react";
import cookie from "cookie";

import type { Maybe } from "./interfaces";
import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";
import { AccessToken } from "./access-token";
import { fetchWithRetry } from "./fetch-with-retry";
import { logger } from "./logger";
import { wait } from "./utils";

export enum Status {
  Error,
  Fetching,
  Initializing,
  Missing,
  Ready,
  Watching,
}

const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

// module level private static property
let status = Status.Initializing;

export async function forceTokenRefresh(setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>): Promise<void> {
  if (status === Status.Fetching || status === Status.Watching) return;
  if (validRefreshTokenExpiresCookie()) {
    setAccessToken(await tokenRefresh());
  }
}

async function tokenRefresh(): Promise<Maybe<AccessToken>> {
  if (status === Status.Fetching) {
    throw new Error("[Auth] encountered multiple attempts to refresh tokens");
  }
  try {
    status = Status.Fetching;
    logger.debug("[Auth] initiating request to refresh tokens");

    const response = await fetchWithRetry({
      attempts: 20,
      delay: { initial: 100, max: 60_000 },
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
      timeout: 10_000,
    });

    if (response.status === 200) {
      const raw = await response.text();
      const token = AccessToken.parse(raw);
      if (token) {
        status = Status.Ready;
        logger.debug("[Auth] request to refresh tokens successful");
        return token;
      } else {
        return _error("[Auth] request to refresh tokens failed");
      }
    } else {
      const { status, statusText } = response;
      return _error("[Auth] request to refresh tokens failed", { status, statusText });
    }
  } catch (e) {
    return _error("[Auth] request to refresh tokens failed", e);
  }
}

function shouldRefreshTokens(token: Maybe<AccessToken>): boolean {
  if (token === null || token.expiresSoon()) return validRefreshTokenExpiresCookie();
  return false;
}

export function silentTokenRefresh(
  accessToken: Maybe<AccessToken>,
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>
): Maybe<() => void> {
  if (status === Status.Initializing && !accessToken) {
    // Maybe fetch the initial token
    if (validRefreshTokenExpiresCookie()) {
      withRefreshLock(tokenRefresh)
        .then(token => {
          setAccessToken(token);
        })
        .catch(error => {
          throw error;
        });
    }
    return null;
  } else if (status === Status.Error && !accessToken) {
    return _error("[Auth] skipping initializing refresh token interval because of previous error");
  } else if (status === Status.Fetching) {
    return _error("[Auth] skipping initializing refresh token interval because already fetching");
  } else if (status === Status.Watching) {
    return _error("[Auth] skipping initializing refresh token interval because already watching");
  } else if (!validRefreshTokenExpiresCookie()) {
    logger.error("[Auth] skipping initializing refresh token interval because of missing or invalid refreshTokenExpires cookie"); // prettier-ignore
    return null;
  }

  status = Status.Watching;
  logger.debug("[Auth] initializing refresh token interval");
  let interval: NodeJS.Timer | null = setInterval(tick, 60_000);

  function tick() {
    if (shouldRefreshTokens(accessToken)) {
      withRefreshLock(tokenRefresh)
        .then(token => {
          setAccessToken(token);
        })
        .catch(error => {
          throw error;
        });
    }
  }

  function cleanup() {
    if (interval) {
      logger.debug("[Auth] cleaning up refresh token interval");
      clearInterval(interval);
      interval = null;
    }
  }

  return cleanup;
}

function validRefreshTokenExpiresCookie() {
  const cookies = cookie.parse(document.cookie);
  const refreshTokenExpires: Maybe<string> = cookies.refreshTokenExpires;
  if (!refreshTokenExpires) {
    status = Status.Missing;
    logger.debug("[Auth] the refreshTokenExpires cookie is either missing or expired");
    return false;
  }
  const expires = new Date(refreshTokenExpires);
  if (!(expires instanceof Date) || isNaN(expires.valueOf()) || expires < new Date()) {
    logger.debug("[Auth] the refreshTokenExpires cookie is either invalid or expired");
    return false;
  }
  return true;
}

function _error(msg?: string, ...optionalParams: any[]): null {
  status = Status.Error;
  logger.error(msg, optionalParams);
  return null;
}

/**
 * This is an attempt to keep multiple tabs from attempting refreshing tokens at the same time.
 * The real solution is probably a service worker.
 */
async function withRefreshLock<T>(cb: () => Promise<T>, attempts = 20): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    const lock = window.localStorage.getItem("refreshLock");
    logger.debug("[Auth] attempting to acquire token refresh lock");
    if (!lock || lock === "0") {
      window.localStorage.setItem("refreshLock", "1");
      logger.debug("[Auth] acquired token refresh lock");
      const result = await cb();
      window.localStorage.setItem("refreshLock", "0");
      logger.debug("[Auth] released token refresh lock");
      return result;
    }
    logger.debug(`[Auth] failed to acquire token refresh lock, attempt ${i + 1}`);
    await wait(1000);
  }
  throw new Error("[Lock] unable to acquire token refresh lock");
}
