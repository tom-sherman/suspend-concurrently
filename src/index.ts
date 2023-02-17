import { useRef, useSyncExternalStore } from "react";
import { createPromiseStore } from "./promise-store";
import type { ResolveConcurrentlyFn } from "./types";

const hookFactory = (resolveConcurrently: ResolveConcurrentlyFn) => {
  const store = createPromiseStore(resolveConcurrently);

  return (promises: Promise<any>[]) => {
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

export const usePromiseAll = hookFactory((promises: Promise<any>[]) =>
  Promise.all(promises)
) as typeof Promise.all;
export const usePromiseAllSettled = hookFactory((promises: Promise<any>[]) =>
  Promise.allSettled(promises)
) as typeof Promise.allSettled;
export const usePromiseAny = hookFactory((promises: Promise<any>[]) =>
  Promise.any(promises)
) as typeof Promise.any;
export const usePromiseRace = hookFactory((promises: Promise<any>[]) =>
  Promise.race(promises)
) as typeof Promise.race;
