const baseMap = Symbol("baseMap");

class Value<T> {
  constructor(public value: T) {}
}

function checkKeys(keys: any[]) {
  if (!Array.isArray(keys)) {
    throw new TypeError("The keys parameter must be an array");
  }
}

function getLastMap(
  { [baseMap]: map }: { [baseMap]: WeakMap<any, any> },
  keys: any[],
  create?: any
) {
  for (const key of keys) {
    if (!map.has(key)) {
      if (create) {
        map.set(key, new WeakMap());
      } else {
        return undefined;
      }
    }

    map = map.get(key);
  }

  return map;
}

export class ManyKeysWeakMap<K extends object, V> extends WeakMap {
  [baseMap]: WeakMap<any, any>;

  constructor() {
    super();
    this[baseMap] = new WeakMap();

    // eslint-disable-next-line prefer-rest-params
    const [pairs] = arguments; // WeakMap compat
    if (pairs === null || pairs === undefined) {
      return;
    }

    if (typeof pairs[Symbol.iterator] !== "function") {
      throw new TypeError(
        typeof pairs +
          " is not iterable (cannot read property Symbol(Symbol.iterator))"
      );
    }

    for (const [keys, value] of pairs) {
      this.set(keys, value);
    }
  }

  set(keys: K[], value: V) {
    checkKeys(keys);
    const lastMap = getLastMap(this, keys, true);
    lastMap!.set(Value, value);
    return this;
  }

  get(keys: K[]): V | undefined {
    checkKeys(keys);
    const lastMap = getLastMap(this, keys);
    return lastMap ? lastMap.get(Value) : undefined;
  }

  has(keys: K[]) {
    checkKeys(keys);
    const lastMap = getLastMap(this, keys);
    return Boolean(lastMap) && lastMap!.has(Value);
  }

  delete(keys: K[]) {
    checkKeys(keys);
    const lastMap = getLastMap(this, keys);
    return Boolean(lastMap) && lastMap!.delete(Value);
  }

  clear() {
    this[baseMap] = new WeakMap();
  }

  get [Symbol.toStringTag]() {
    return "ManyKeysWeakMap";
  }
}
