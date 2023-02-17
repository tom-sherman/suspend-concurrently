import { ManyKeysWeakMap } from "many-keys-weakmap";

const unresolvedPromise = new Promise(() => {});

export function createPromiseStore(resolveConcurrently) {
  const cache = new ManyKeysWeakMap();
  const listeners = new Set();

  function emitChange() {
    console.log("emitting");
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    cachePromises(promises) {
      if (cache.has(promises)) return;
      cache.set(promises, resolveConcurrently(promises));
      emitChange();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot(promises) {
      return cache.get(promises) ?? unresolvedPromise;
    },
  };
}
