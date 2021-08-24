import type { Dispatch, SetStateAction } from "react";
import type { GetServerSidePropsContext } from "next";
import type { HeaderInit } from "node-fetch";

import { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { subMinutes } from "date-fns";
import { isString, isDate } from "lodash-es";

import type { Maybe, AccessToken } from "./interfaces";

import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";

type useRefreshTokenResult = [boolean, Error?];

const { fetch } = fetchPonyfill();
const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

// In memory jwt for client side authorization
let accessToken: Maybe<AccessToken>;

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

/**
 * Fetch an api access token from either the server or the client.
 * The `refreshToken` itself is httpOnly and cannot be accessed from the browser.
 * To indicate if we may have a valid `refreshToken`, the cookie `refreshTokenExpires`
 * is set as a non httpOnly cookie. It is also unsigned. If multiple checks pass,
 * attempt to fetch a new access token from the api server.
 *
 * If in SSR, the "Set-Cookie" header will be passed from the server to the client.
 */
export const fetchAccessToken = async (ctx?: GetServerSidePropsContext): Promise<Maybe<AccessToken>> => {
  const isSSR = typeof window === "undefined" && ctx?.req !== undefined;
  const cookies = cookie.parse(isSSR ? ctx.req.headers?.cookie ?? "" : document.cookie);
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

    if (isSSR && isString(ctx.req.headers.cookie)) {
      headers.Cookie = ctx.req.headers.cookie;
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
          ctx.res.setHeader("Set-Cookie", response.headers.get("Set-Cookie") as string);
        }

        _accessToken = { token, tokenExpires: new Date(tokenExpires) };
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      if (isSSR) {
        // I don't think this is the correct response with how I am using this.
        // I should handle how to response to a failed refresh higher up in the app.
        ctx.res.writeHead(302, { Location: "/login" });
        ctx.res.end();
      }
      return null;
      // Router.push("/login");
    }
  }

  if (!isSSR) accessToken = _accessToken;

  return _accessToken;
};
