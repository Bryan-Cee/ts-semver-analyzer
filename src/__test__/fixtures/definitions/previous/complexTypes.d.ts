export interface Config {
  callback: (error: Error | null | undefined) => void;
  data: { id: number } & { name: string };
}