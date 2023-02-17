export class Deferred<T> {
  promise: Promise<T>;
  resolve!: (value: T) => void;
  reject!: (reason?: T) => void;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

interface PromiseCache {
  promise: Promise<void>;
  error?: any;
  response?: any;
}

const promiseCaches: PromiseCache[] = [];

export const usePromise = <Result>(promise: Promise<Result>): Result => {
  // Cache Check
  for (const promiseCache of promiseCaches) {
    // If an error occurred,
    if (Object.prototype.hasOwnProperty.call(promiseCache, "error")) {
      throw promiseCache.error;
    }

    // If a response was successful,
    else if (Object.prototype.hasOwnProperty.call(promiseCache, "response")) {
      return promiseCache.response;
    }
    throw promiseCache.promise;
  }

  // The request is new or has changed.
  const promiseCache: PromiseCache = {
    promise:
      // Make the promise request.
      promise
        .then((response: Result) => {
          promiseCache.response = response;
        })
        .catch((e: Error) => {
          promiseCache.error = e;
        }),
  };

  promiseCaches.push(promiseCache);
  throw promiseCache.promise;
};
