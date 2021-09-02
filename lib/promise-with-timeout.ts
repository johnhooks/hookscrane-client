/**
 * Wrap a Promise with a timeout that rejects in <timeout> milliseconds
 *
 * @param timeout - The number of millisecond in which to timeout the promise.
 * @param promise - The promise to wrap in a timeout.
 * @param cleanup - An optional callback to execute if the promise times out.
 */
export function promiseWithTimeout<T>(timeout: number, promise: Promise<T>, cleanup?: () => Error): Promise<T> {
  let id: NodeJS.Timeout;

  const cancel = new Promise<never>((_resolve, reject) => {
    id = setTimeout(() => {
      if (cleanup) return reject(cleanup());
      reject(new Error(`[Promise] Timed out in ${timeout} ms`));
    }, timeout);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, cancel]).then(result => {
    clearTimeout(id);
    return result;
  });
}
