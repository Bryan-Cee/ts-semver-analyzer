export interface Container<T extends object> {
  value: T;
  transform: <U extends object>(fn: (value: T) => U) => Container<U>;
}