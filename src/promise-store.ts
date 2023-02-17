import { ManyKeysWeakMap } from "many-keys-weakmap";
import { ResolveConcurrentlyFn } from "./types";

const unresolvedPromise = new Promise(() => {});

type Listener = () => void;

export function createPromiseStore(resolveConcurrently: ResolveConcurrentlyFn) {
  const cache = new ManyKeysWeakMap();
  const listeners = new Set<Listener>();

  function emitChange() {
    console.log("emitting");
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    cachePromises(promises: Promise<any>[]) {
      if (cache.has(promises)) return;
      cache.set(promises, (resolveConcurrently as any)(promises));
      emitChange();
    },

    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot(promises: Promise<any>[]) {
      return cache.get(promises) ?? unresolvedPromise;
    },
  };
}
