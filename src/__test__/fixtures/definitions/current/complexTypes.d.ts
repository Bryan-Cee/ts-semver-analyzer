export interface Config {
  callback: (error: Error | null) => void;
  data: { id: number };
}