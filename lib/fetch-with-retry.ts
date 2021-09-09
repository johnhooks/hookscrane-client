import { fetchWithTimeout, FetchWithTimeoutOptions } from "./fetch-with-timeout";
import { logger } from "./logger";
import { wait } from "./utils";

interface FetchWithRetryOptions extends FetchWithTimeoutOptions {
  attempts: number;
  delay: { initial: number; max: number; jitter?: boolean };
}

/**
 * Options inspired by https://www.apollographql.com/docs/react/api/link/apollo-link-retry/
 */
export async function fetchWithRetry({
  attempts,
  delay: { max, initial, jitter = true },
  input,
  init,
  timeout,
}: FetchWithRetryOptions): Promise<globalThis.Response> {
  let delay = 0;
  let currentDelay = delay;

  logger.debug(`[Fetch] initializing fetch request`);

  for (let i = 0; i < attempts; i++) {
    if (i !== 0) {
      delay = i === 1 ? initial : delay + delay; // the delay of each subsequent retry is increased exponentially
      delay = delay > max ? max : delay;
      currentDelay = jitter ? delay * Math.random() : delay;
      logger.debug(`[Fetch] delaying ${currentDelay} ms before attempting the next fetch request`);
    }

    try {
      await wait(currentDelay);
      logger.debug(`[Fetch] initializing fetch request attempt ${i + 1}`);
      const response = await fetchWithTimeout({ input, init, timeout });
      return response;
    } catch (error) {
      logger.error(`[Fetch] failed fetch request attempt ${i + 1}`, error);
    }
  }

  throw new Error(`[Fetch] failed to fetch resource in ${attempts} attempts`);
}
