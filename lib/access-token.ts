import cookie from "cookie";
import { formatDistance, subMinutes } from "date-fns";
import { isObject, isString } from "lodash-es";

import type { Maybe, AccessTokenPayload } from "lib/interfaces";

import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "lib/constants";
import { fetchWithRetry } from "lib/fetch-with-retry";
import { logger } from "lib/logger";

const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

export class AccessToken {
  constructor(readonly token: string, readonly expires: Date) {}

  static isPayload(value: unknown): value is { token: string; tokenExpires: string } {
    return (
      isObject(value) &&
      isString((value as unknown as AccessTokenPayload).token) &&
      isString((value as unknown as AccessTokenPayload).tokenExpires)
    );
  }

  static parse(payload: string): Maybe<AccessToken> {
    let data: unknown;

    try {
      data = JSON.parse(payload);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // `fetch` may have received an incomplete response body
        logger.debug("[Auth] Unable to parse refresh token response body", error.message);
        return null;
      }
      throw error;
    }

    if (AccessToken.isPayload(data)) {
      const expires = new Date(data.tokenExpires);
      if (!(expires instanceof Date) || isNaN(expires.valueOf())) return null;
      return new AccessToken(data.token, expires);
    } else {
      return null;
    }
  }

  static shouldRefresh(token: Maybe<AccessToken>): boolean {
    if (token === null || token.expiresSoon()) return AccessToken.validRefreshTokenExpires();
    return false;
  }

  static validRefreshTokenExpires() {
    const cookies = cookie.parse(document.cookie);
    const refreshTokenExpires: Maybe<string> = cookies.refreshTokenExpires;
    if (!refreshTokenExpires) {
      logger.debug("[Auth] The refreshTokenExpires cookie is either missing or expired");
      return false;
    }
    const expires = new Date(refreshTokenExpires);
    if (!(expires instanceof Date) || isNaN(expires.valueOf()) || expires < new Date()) {
      logger.debug("[Auth] The refreshTokenExpires cookie is either invalid or expired");
      return false;
    }
    return true;
  }

  static async refresh(): Promise<Maybe<AccessToken>> {
    try {
      logger.debug("[Auth] Initiating token refresh request");

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
      });

      if (response.status === 200) {
        const raw = await response.text();
        const token = AccessToken.parse(raw);
        if (token) {
          logger.debug("[Auth] Successfully refreshed tokens");
        } else {
          logger.debug("[Auth] Failed to refresh tokens");
        }
        return token;
      } else {
        const { status, statusText } = response;
        logger.debug("[Auth] Failed to refresh tokens", { status, statusText });
        return null;
      }
    } catch (error) {
      logger.debug("[Auth] Failed to refresh tokens", error);
      return null;
    }
  }

  expiresSoon(): boolean {
    const now = new Date();
    if (this.expires <= now) {
      logger.debug(`[Auth] The accessToken expired ${formatDistance(this.expires, now)} ago`);
      return true;
    }
    logger.debug(`[Auth] The accessToken expires in ${formatDistance(this.expires, now)}`);
    return subMinutes(this.expires, 2) <= now;
  }
}
