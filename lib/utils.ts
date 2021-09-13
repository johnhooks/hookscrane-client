import { logger } from "./logger";

export function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise(resolve => {
    const id = setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * This is an attempt to keep multiple tabs from refreshing the authentication tokens at the same time.
 * The real solution is probably a service worker.
 */
export async function withLock<T>(key: string, cb: () => Promise<T>): Promise<T> {
  const lock = window.localStorage.getItem(key);

  if (!lock || lock === "0") {
    // Using a random id to confirm that the lock was acquired by this tab.
    const id = randomId();
    window.localStorage.setItem(key, id);
    // Delay because I don't believe localStorage is intended to be used this way,
    // and if two tabs were able to setItem after verifying lock === "0", they might both
    // attempt to request refresh the tokens.
    await wait(50);
    if (window.localStorage.getItem(key) === id) {
      logger.debug(`[Lock] acquired ${key}`);
      const result = await cb();
      window.localStorage.setItem(key, "0");
      logger.debug(`[Lock] released ${key}`);
      return result;
    }
  }

  throw new Error(`[Lock] unable to acquire lock key: ${key}`);
}

export function randomId(): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}
