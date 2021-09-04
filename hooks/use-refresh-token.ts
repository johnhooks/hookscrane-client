import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";

import type { Maybe } from "lib/interfaces";
import { AccessToken } from "lib/access-token";
import { logger } from "lib/logger";

export enum Status {
  Error,
  Fetching,
  Missing,
  Ready,
}

/**
 * Initialize an interval to refresh the authentication tokens.
 */
export function useRefreshToken(
  accessToken: Maybe<AccessToken>,
  setAccessToken: Dispatch<SetStateAction<Maybe<AccessToken>>>
): [Status, () => Promise<void>] {
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

  const [status, setStatus] = useState(Status.Fetching);
  const refreshCallback = useCallback(
    function refresh() {
      setStatus(Status.Fetching);
      return AccessToken.refresh()
        .then(token => {
          setAccessToken(token);
          setStatus(token ? Status.Ready : Status.Missing);
        })
        .catch(error => {
          // There is already a try catch inside refreshTokens... but just in case
          throw error;
        });
    },
    [setAccessToken]
  );

  /**
   * Attempt to fetch the initial accessToken if the refreshTokenExpires cookie seems valid.
   */
  useEffect(() => {
    if (!AccessToken.validRefreshTokenExpires()) return;
    refreshCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Initialize an interval to refresh the access token.
   * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
   */
  useEffect(() => {
    // If there isn't an valid refreshTokenExpires no need to schedule a refresh.
    if (status === Status.Fetching || !AccessToken.validRefreshTokenExpires()) return;

    logger.debug("[Auth] Initializing refresh token interval");
    let interval: NodeJS.Timer | null = setInterval(tick, 60_000);

    function tick() {
      if (AccessToken.shouldRefresh(accessToken)) {
        refreshCallback();
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
    // Does the status dependency cause this to constantly rerender?
  }, [accessToken, status, refreshCallback]);

  // Always return loading false in SSR
  if (typeof window === "undefined") return [Status.Missing, () => Promise.resolve()];

  return [status, refreshCallback];
}
