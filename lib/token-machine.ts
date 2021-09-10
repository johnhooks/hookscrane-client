import { createMachine, assign } from "xstate";
import cookie from "cookie";

import type { Maybe } from "./interfaces";
import { API_ENDPOINT, LOCAL_API_ENDPOINT } from "./constants";
import { AccessToken } from "./access-token";
import { withLock } from "./utils";

type TokenEvent = { type: "FETCH" } | { type: "CANCEL" } | { type: "LOGIN"; token: AccessToken };

interface TokenContext {
  token: Maybe<AccessToken>;
}

type TokenTypestate =
  | {
      value: "idle";
      context: TokenContext;
    }
  | {
      value: "monitoring";
      context: TokenContext & { token: AccessToken };
    }
  | {
      value: "loading";
      context: TokenContext;
    };

const TOKEN_REFRESH_LOCK_KEY = "tokenRefreshLock";
const ENDPOINT = typeof window === "undefined" ? (LOCAL_API_ENDPOINT as string) : API_ENDPOINT;

export const tokenMachine = createMachine<TokenContext, TokenEvent, TokenTypestate>(
  {
    id: "token",
    initial: "idle",
    context: {
      token: null,
    },
    states: {
      idle: {
        on: {
          FETCH: {
            target: "loading",
            cond: "shouldAttemptRefresh",
          },
          LOGIN: {
            target: "monitoring",
            actions: assign({
              token: (_, event) => event.token,
            }),
          },
        },
      },
      loading: {
        invoke: {
          id: "fetch-tokens",
          src: (_context, _event) => withLock(TOKEN_REFRESH_LOCK_KEY, fetchTokens),
          onDone: {
            target: "monitoring",
            actions: assign({
              token: (_, event) => event.data,
            }),
          },
          // Should it transition to monitoring?
          onError: "idle",
        },
        on: {
          CANCEL: "idle",
        },
      },
      monitoring: {
        invoke: {
          id: "check-tokens",
          src: "checkTokens",
        },
        on: {
          CANCEL: "idle",
          FETCH: "loading",
          LOGIN: {
            actions: assign({
              token: (_, event) => event.token,
            }),
          },
        },
      },
    },
  },
  {
    actions: {
      checkShouldRefresh: (context: TokenContext, _event: any) => {
        const { token } = context;
        if (token === null || token.expiresSoon()) return validRefreshTokenExpiresCookie();
        return false;
      },
    },
    guards: {
      shouldAttemptRefresh: ({ token }, _event) => {
        if (token === null || token.expiresSoon()) return validRefreshTokenExpiresCookie();
        return false;
      },
    },
    services: {
      // TODO replace the inline promise invoke with this service
      fetchTokens: (_context, _event) => (callback, _onReceive) => {
        withLock(TOKEN_REFRESH_LOCK_KEY, fetchTokens)
          .then(token => {
            callback({ type: "LOGIN", token });
          })
          .catch(_error => {
            callback({ type: "CANCEL" });
          });
      },
      checkTokens: (context, _event) => (callback, _onReceive) => {
        const id = setInterval(() => {
          const token = context.token;
          if (token === null || token.expiresSoon()) {
            if (validRefreshTokenExpiresCookie()) {
              callback({ type: "FETCH" });
            } else {
              // If I don't do this it will just keep trying... might be what I want.
              // callback({ type: "CANCEL" });
            }
          }
        }, 60_000);

        // Perform cleanup
        return () => clearInterval(id);
      },
    },
  }
);

async function fetchTokens(): Promise<AccessToken> {
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
    const raw = await response.text();
    const token = AccessToken.parse(raw);
    if (token) {
      return token;
    } else {
      throw new Error("request to refresh tokens failed, invalid response");
    }
  } else {
    const { status, statusText } = response;
    throw new Error(`request to refresh tokens failed, status: ${status} - ${statusText}`);
  }
}

function validRefreshTokenExpiresCookie() {
  const cookies = cookie.parse(document.cookie);
  const refreshTokenExpires: Maybe<string> = cookies.refreshTokenExpires;
  if (!refreshTokenExpires) return false;
  const expires = new Date(refreshTokenExpires);
  if (!(expires instanceof Date) || isNaN(expires.valueOf()) || expires < new Date()) return false;
  return true;
}
