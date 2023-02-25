import ManyKeysWeakMap from "many-keys-weakmap";
import type { ResolveConcurrentlyFn } from "./types";

const cacheFactory = (resolveConcurrently: ResolveConcurrentlyFn) => {
  const cache = new ManyKeysWeakMap();

  return (promises: Promise<any>[]) => {
    const cached = cache.get(promises);
    if (cached) return cached;

    const promise = (resolveConcurrently as any)(promises);
    cache.set(promises, promise);
    return promise;
  };
};

export const suspendAll = cacheFactory((promises: Promise<any>[]) =>
  Promise.all(promises)
) as typeof Promise.all;
export const suspendAllSettled = cacheFactory((promises: Promise<any>[]) =>
  Promise.allSettled(promises)
) as typeof Promise.allSettled;
export const suspendAny = cacheFactory((promises: Promise<any>[]) =>
  Promise.any(promises)
) as typeof Promise.any;
export const suspendRace = cacheFactory((promises: Promise<any>[]) =>
  Promise.race(promises)
) as typeof Promise.race;
