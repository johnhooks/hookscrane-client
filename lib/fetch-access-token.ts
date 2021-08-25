import type { GetServerSidePropsContext } from "next";
import type { HeaderInit } from "node-fetch";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { isString } from "lodash-es";

import type { Maybe, AccessToken } from "./interfaces";
import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";

type Context = GetServerSidePropsContext;

const { fetch } = fetchPonyfill();
const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

// In memory jwt for client side authorization
let accessToken: Maybe<AccessToken>;

/**
 * Fetch an api access token from either the server or the client.
 * The `refreshToken` itself is httpOnly and cannot be accessed from the browser.
 * To indicate if we may have a valid `refreshToken`, the cookie `refreshTokenExpires`
 * is set as a non httpOnly cookie. It is also unsigned. If multiple checks pass,
 * attempt to fetch a new access token from the api server.
 *
 * If in SSR, the "Set-Cookie" header will be passed from the server to the client.
 */
export const fetchAccessToken = async (ctx?: Context): Promise<Maybe<AccessToken>> => {
  const isSSR = isContext(ctx);
  const cookies = cookie.parse(isSSR ? (ctx as Context).req.headers?.cookie ?? "" : document.cookie);
  const refreshToken: Maybe<string> = cookies.refreshToken;
  const refreshTokenExpires: Maybe<string> = cookies.refreshTokenExpires;

  let _accessToken: Maybe<AccessToken> = null;

  if (!accessToken) {
    if (isSSR && !refreshToken) return null;
    if (!isSSR) {
      if (!refreshTokenExpires) return null;
      const expires = new Date(refreshTokenExpires);
      if (expires instanceof Date && isNaN(expires.valueOf())) return null; // invalid
      if (expires < new Date()) return null; // expired
    }

    const headers: HeaderInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };

    if (isSSR && isString((ctx as Context).req.headers.cookie)) {
      headers.Cookie = (ctx as Context).req.headers.cookie as string;
    }

    try {
      const response = await fetch(`${ENDPOINT}/refresh`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({}),
      });

      if (response.status === 200) {
        const { token, tokenExpires } = await response.json();

        // Forward the Set-Cookie header if in SSR
        if (isSSR && isString(response.headers.get("Set-Cookie"))) {
          (ctx as Context).res.setHeader("Set-Cookie", response.headers.get("Set-Cookie") as string);
        }

        _accessToken = { token, tokenExpires: new Date(tokenExpires) };
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      if (isSSR) {
        // I don't think this is the correct response with how I am using this.
        // I should handle how to response to a failed refresh higher up in the app.
        (ctx as Context).res.writeHead(302, { Location: "/login" });
        (ctx as Context).res.end();
      }
      return null;
      // Router.push("/login");
    }
  }

  if (!isSSR) accessToken = _accessToken;

  return _accessToken;
};

function isContext(ctx: unknown): ctx is Context {
  return typeof window === "undefined" && !!ctx && (ctx as Context)?.req !== undefined;
}
