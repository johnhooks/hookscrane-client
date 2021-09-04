import fetchPonyfill from "fetch-ponyfill";
import { promiseWithTimeout } from "./promise-with-timeout";

const { fetch } = fetchPonyfill();

export interface FetchWithTimeoutOptions {
  input: globalThis.RequestInfo;
  init?: globalThis.RequestInit | undefined;
  timeout?: number;
}

export function fetchWithTimeout({
  input,
  init,
  timeout = 500,
}: FetchWithTimeoutOptions): Promise<globalThis.Response> {
  const controller = new AbortController();
  const signal = controller.signal;
  return promiseWithTimeout(timeout, fetch(input, { ...init, signal }), () => {
    controller.abort();
    return new Error(`[Fetch] Timed out in ${timeout} ms.`);
  });
}
