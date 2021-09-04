export function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise(resolve => {
    const id = setTimeout(() => {
      resolve();
    }, ms);
  });
}
