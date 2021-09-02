import { useEffect, useRef } from "react";

export function useTimeout(callback: () => void, ms: number): void {
  const savedCallback = useRef(callback);

  // Remember the last callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    const id = setTimeout(tick, ms);
    return () => clearTimeout(id);
  }, [ms]);
}
