import { fetchWithTimeout } from "./fetch-with-timeout";
import { logger } from "./logger";

interface FetchWithRetryInput {
  count: number;
  timeout: number;
  input: globalThis.RequestInfo;
  init?: globalThis.RequestInit | undefined;
}

export async function fetchWithRetry({
  count,
  timeout,
  input,
  init,
}: FetchWithRetryInput): Promise<globalThis.Response> {
  for (let i = 0; i < count; i++) {
    logger.debug(`[Fetch] Initializing fetch request attempt ${i + 1}`);
    try {
      const response = await fetchWithTimeout(timeout, input, init);
      return response;
    } catch (error) {
      logger.error(`[Fetch] Failed retry count ${i + 1}`, error);
    }
  }
  throw new Error(`[Fetch] Failed to fetch resource in ${count} attempts`);
}
