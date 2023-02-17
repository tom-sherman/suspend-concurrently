import { ManyKeysWeakMap } from "many-keys-weakmap";

export class PromiseStore {
  #cache;
  #listeners;
  #resolveConcurrently;
  constructor(resolveConcurrently) {
    this.#cache = new ManyKeysWeakMap();
    this.#listeners = new Set();
    this.#resolveConcurrently = resolveConcurrently;
  }

  cachePromises(promises) {
    this.#cache.set(promises, this.#resolveConcurrently(promises));
    this.#emitChange();
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emitChange() {
    for (const listener of this.#listeners) {
      listener();
    }
  }

  getSnapshot(promises) {
    return this.#cache.get(promises);
  }
}
