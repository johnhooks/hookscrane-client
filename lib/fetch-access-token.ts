import type { GetServerSidePropsContext } from "next";
import type { HeaderInit } from "node-fetch";
import cookie from "cookie";
import fetchPonyfill from "fetch-ponyfill";
import { isString } from "lodash-es";

import type { Maybe } from "./interfaces";
import { AccessToken } from "./access-token";
import { LOCAL_API_ENDPOINT } from "./constants";

type Context = GetServerSidePropsContext;

const { fetch } = fetchPonyfill();
const ENDPOINT = LOCAL_API_ENDPOINT as string;

/**
 * Attempt to fetch an API accessToken in the SSR environment.
 * This function should only be called from inside a `getServerSideProps` function.
 *
 * It passes the response Set-Cookie header to the client, so it can refreshing the session.
 * The access token used for SSR will be abandoned after one use.
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
      const body = await response.text();
      const accessToken = AccessToken.parse(body);

      const maybeSetCookie = response.headers.get("Set-Cookie");

      if (isString(maybeSetCookie)) {
        // Forward the response Set-Cookie header to the client
        ctx.res.setHeader("Set-Cookie", maybeSetCookie);
      }

      return accessToken;
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    return null;
  }
}
