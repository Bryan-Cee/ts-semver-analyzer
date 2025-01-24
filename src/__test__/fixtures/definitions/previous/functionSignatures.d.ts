export interface Handlers {
  onSuccess: () => void;
  onError: (error: Error) => void;
  transform: <T>(data: T) => T;
}

export type ProcessFunction = <T>(data: T[]) => T[];