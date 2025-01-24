export interface Config {
  items: string[];
  callback: (error: Error | null) => void;
}