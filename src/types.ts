export type ResolveConcurrentlyFn =
  | typeof Promise.all
  | typeof Promise.allSettled
  | typeof Promise.any
  | typeof Promise.race;
