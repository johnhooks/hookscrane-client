import fetchPonyfill from "fetch-ponyfill";
import { promiseWithTimeout } from "./promise-with-timeout";

const { fetch } = fetchPonyfill();

export function fetchWithTimeout(
  timeout: number,
  input: globalThis.RequestInfo,
  init?: globalThis.RequestInit | undefined
): Promise<globalThis.Response> {
  const controller = new AbortController();
  const signal = controller.signal;
  return promiseWithTimeout(timeout, fetch(input, { ...init, signal }), () => {
    controller.abort();
    return new Error(`[Fetch] Timed out in ${timeout} ms.`);
  });
}
