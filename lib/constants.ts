/**
 * NOTE: `process.env` isn't an indexable object on the client
 * ```js
 * process.env[variable] // This won't work
 * ```
 * https://github.com/vercel/next.js/issues/16791
 */

export const BROWSER = typeof window !== "undefined";

if (!BROWSER && typeof process.env.LOCAL_API_ENDPOINT !== "string") {
  throw new TypeError(`Environmental variable LOCAL_API_ENDPOINT not provided`);
}

if (typeof process.env.NEXT_PUBLIC_API_ENDPOINT !== "string") {
  throw new TypeError(
    `Environmental variable NEXT_PUBLIC_API_ENDPOINT not provided`
  );
}

export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const LOCAL_API_ENDPOINT = process.env.LOCAL_API_ENDPOINT;

console.log(API_ENDPOINT, LOCAL_API_ENDPOINT);
