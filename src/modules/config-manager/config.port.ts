export interface ConfigPort<T = any> {
  set(value: any, propPath: string): void;

  get<R>(propPath: string): R;

  getKeys(propPath: string): string[];

  getAll<R>(propPath: string): R[];

  save(): T;
}
