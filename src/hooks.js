import { useSyncExternalStore } from "react";
import { PromiseStore } from "./promise-store";

const hookFactory = (resolveConcurrently) => {
  const store = new PromiseStore(resolveConcurrently);
  return (promises) =>
    useSyncExternalStore(store.subscribe, () => store.getSnapshot(promises));
};

export const usePromiseAll = hookFactory(Promise.all);
export const usePromiseAllSettled = hookFactory(Promise.allSettled);
export const usePromiseAny = hookFactory(Promise.any);
export const usePromiseRace = hookFactory(Promise.race);
