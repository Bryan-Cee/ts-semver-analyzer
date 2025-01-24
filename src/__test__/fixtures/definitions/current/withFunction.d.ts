export interface Config {
  items: string[];
  callback: (error: Error) => void;
}