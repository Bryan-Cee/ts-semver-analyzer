import { createFixture } from './factories';

export const fixtures = {
  basic: {
    previous: createFixture(`
      export interface Config {
        items: string[];
      }
    `),
    current: createFixture(`
      export interface Config {
        items: string[] | number[];
      }
    `)
  },

  functionSignatures: {
    previous: createFixture(`
      export interface Process {
        onSuccess(): void;
        transform<T>(input: T): T;
      }
      export type ProcessFunction = (data: any) => void;
    `),
    current: createFixture(`
      export interface Process {
        onSuccess(data?: any): void;
        transform<T extends object>(input: T): T;
      }
    `)
  },

  withFunction: {
    previous: createFixture(`
      export interface ErrorHandler {
        callback: (error: Error | null) => void;
      }
    `),
    current: createFixture(`
      export interface ErrorHandler {
        callback: (error: Error) => void;
      }
    `)
  },

  empty: {
    previous: createFixture(''),
    current: createFixture('')
  },

  complexTypes: {
    previous: createFixture(`
      export interface Config {
        data: { id: number } & { name: string };
      }
    `),
    current: createFixture(`
      export interface Config {
        data: { id: number };
      }
    `)
  },

  nestedTypes: {
    previous: createFixture(`
      export interface Settings {
        theme: 'light' | 'dark';
        config: {
          enabled: boolean;
        };
      }
    `),
    current: createFixture(`
      export interface Settings {
        theme: 'light' | 'dark' | 'system';
        config: {
          enabled: boolean;
        };
        logLevel: 'debug' | 'info' | 'error';
      }
    `)
  },

  genericTypes: {
    previous: createFixture(`
      export interface Container<T> {
        value: T;
      }
    `),
    current: createFixture(`
      export interface Container<T extends object> {
        value: T;
      }
    `)
  },

  typeInference: {
    previous: createFixture(`
      export function transform<T, U>(input: T): U;
    `),
    current: createFixture(`
      export function transform<T, U extends object>(input: T): U;
    `)
  },

  mappedTypes: {
    previous: createFixture(`
      export type ReadOnly<T> = { readonly [P in keyof T]: T[P] };
    `),
    current: createFixture(`
      export type ReadOnly<T> = { [P in keyof T]: T[P] };
    `)
  },

  conditionalTypes: {
    previous: createFixture(`
      export type TypeName<T> = T extends string ? 'string' : 'other';
    `),
    current: createFixture(`
      export type TypeName<T> = T extends string ? 'string' : T extends number ? 'number' : 'other';
    `)
  },

  templateLiterals: {
    previous: createFixture(`
      export type EventName = 'click' | 'hover';
    `),
    current: createFixture(`
      export type EventName = 'click' | 'hover' | 'focus';
    `)
  }
};
export * from './factories';