import { formatDistance, subMinutes } from "date-fns";
import { isObject, isString } from "lodash-es";

import type { Maybe, AccessTokenPayload } from "lib/interfaces";
import { logger } from "lib/logger";

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
