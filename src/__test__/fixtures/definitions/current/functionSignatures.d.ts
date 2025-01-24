export interface Handlers {
  onSuccess: (data?: unknown) => void;
  onError: (error: Error | string) => void;
  transform: <T, R>(data: T) => R;
}

export interface Process {
  <T>(data: T[]): T[];
}