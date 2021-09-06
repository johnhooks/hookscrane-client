import jwtDecode, { JwtPayload } from "jwt-decode";
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
    try {
      const data = JSON.parse(payload);
      if (!AccessToken.isPayload(data)) return null;
      const now = Date.now().valueOf() / 1000;
      const decoded = jwtDecode<JwtPayload>(data.token);
      if (typeof decoded.exp === "number" && now < decoded.exp) {
        const expires = new Date(decoded.exp * 1000);
        return new AccessToken(data.token, expires);
      }
      return null;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // `fetch` may have received an incomplete response body
        logger.debug("[Auth] Unable to parse refresh token response body", error.message);
        return null;
      }
      throw error;
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
