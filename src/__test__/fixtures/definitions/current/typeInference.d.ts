export declare function infer<T extends unknown>(value: T): T;
export declare function transform<T, U extends T>(value: T, fn: (v: T) => U): U;