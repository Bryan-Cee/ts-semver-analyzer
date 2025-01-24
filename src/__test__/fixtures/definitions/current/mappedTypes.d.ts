export type ReadOnly<T> = {
  readonly [P in keyof T]: T[P] | null;
};
export interface Config {
  data: ReadOnly<{ id: number; name: string }>;
}