import type { GetServerSidePropsContext } from "next";
import type { HeaderInit } from "node-fetch";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { isString } from "lodash-es";

import type { Maybe, AccessToken } from "./interfaces";
import { LOCAL_API_ENDPOINT } from "./constants";

type Context = GetServerSidePropsContext;

const { fetch } = fetchPonyfill();
const ENDPOINT = LOCAL_API_ENDPOINT as string;

/**
 * Fetch an api access token in the SSR environment.
 * This function should only be called from inside a `getServerSideProps` function.
 */
export async function fetchAccessToken(ctx: Context): Promise<Maybe<AccessToken>> {
  const cookies = cookie.parse(ctx.req.headers?.cookie ?? "");
  const refreshToken: Maybe<string> = cookies.refreshToken;

  if (!refreshToken) return null;

  const headers: HeaderInit = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };

  const maybeCookie = ctx.req.headers.cookie;

  if (isString(maybeCookie)) {
    // Forward the request Cookie header to the api server
    headers.Cookie = maybeCookie;
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

      const maybeSetCookie = response.headers.get("Set-Cookie");

      if (isString(maybeSetCookie)) {
        // Forward the response Set-Cookie header to the client
        ctx.res.setHeader("Set-Cookie", maybeSetCookie);
      }

      return { token, tokenExpires: new Date(tokenExpires) };
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    return null;
  }
}
