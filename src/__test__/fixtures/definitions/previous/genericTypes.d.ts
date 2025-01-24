export interface Container<T> {
  value: T;
  transform: <U>(fn: (value: T) => U) => Container<U>;
}