import { ManyKeysWeakMap } from "./many-keys-weakmap";
import { ResolveConcurrentlyFn } from "./types";

type Listener = () => void;

export function createPromiseStore(resolveConcurrently: ResolveConcurrentlyFn) {
  const cache = new ManyKeysWeakMap();
  const listeners = new Set<Listener>();

  function emitChange() {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    cachePromises(promises: Promise<any>[]) {
      if (cache.has(promises)) return;
      const cacheValue = (resolveConcurrently as any)(promises);
      cache.set(promises, cacheValue);
      emitChange();
    },

    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot(promises: Promise<any>[]) {
      const result = cache.get(promises);
      console.log(result);
      if (result) return result;
      throw new Error("Promise not found in cache");
    },
  };
}
