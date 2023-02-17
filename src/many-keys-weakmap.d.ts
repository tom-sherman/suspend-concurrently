// TODO: Can be removed after https://github.com/fregante/many-keys-weakmap/pull/2 is merged and released
declare module "many-keys-weakmap" {
  export class ManyKeysWeakMap<K extends object, V> {
    constructor();
    get(key: K[]): V | undefined;
    set(key: K[], value: V): this;
    has(key: K[]): boolean;
    delete(key: K[]): boolean;
    clear(): void;
  }
}
