import { useRef, useSyncExternalStore } from "react";
import { createPromiseStore } from "./promise-store";

const hookFactory = (resolveConcurrently) => {
  const store = createPromiseStore(resolveConcurrently);

  return (promises) => {
    const hasCached = useRef(false);
    if (!hasCached.current) {
      store.cachePromises(promises);
      hasCached.current = true;
    }

    return useSyncExternalStore(
      store.subscribe,
      () => store.getSnapshot(promises),
      () => store.getSnapshot(promises)
    );
  };
};

export const usePromiseAll = hookFactory((promises) => Promise.all(promises));
export const usePromiseAllSettled = hookFactory((promises) =>
  Promise.allSettled(promises)
);
export const usePromiseAny = hookFactory((promises) => Promise.any(promises));
export const usePromiseRace = hookFactory((promises) => Promise.race(promises));
