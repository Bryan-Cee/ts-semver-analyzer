export declare type Primitive =
  | string
  | number
  | symbol
  | bigint
  | boolean
  | null
  | undefined;
export declare type Scalars = Primitive | Primitive[];
export declare namespace util {
  type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
    V
  >() => V extends U ? 1 : 2
    ? true
    : false;
  export type isAny<T> = 0 extends 1 & T ? true : false;
  export const assertEqual: <A, B>(val: AssertEqual<A, B>) => AssertEqual<A, B>;
  export function assertIs<T>(_arg: T): void;
  export function assertNever(_x: never): never;
  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
  export type MakePartial<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;
  export type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;
  export const arrayToEnum: <T extends string, U extends [T, ...T[]]>(
    items: U
  ) => {
    [k in U[number]]: k;
  };
  export const getValidEnumValues: (obj: any) => any[];
  export const objectValues: (obj: any) => any[];
  export const objectKeys: ObjectConstructor["keys"];
  export const find: <T>(arr: T[], checker: (arg: T) => any) => T | undefined;
  export type identity<T> = objectUtil.identity<T>;
  export type flatten<T> = objectUtil.flatten<T>;
  export type noUndefined<T> = T extends undefined ? never : T;
  export const isInteger: NumberConstructor["isInteger"];
  export function joinValues<T extends any[]>(
    array: T,
    separator?: string
  ): string;
  export const jsonStringifyReplacer: (_: string, value: any) => any;
  export {};
}
export declare namespace objectUtil {
  export type MergeShapes<U, V> = {
    [k in Exclude<keyof U, keyof V>]: U[k];
  } & V;
  type optionalKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? k : never;
  }[keyof T];
  type requiredKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? never : k;
  }[keyof T];
  export type addQuestionMarks<T extends object, _O = any> = {
    [K in requiredKeys<T>]: T[K];
  } & {
    [K in optionalKeys<T>]?: T[K];
  } & {
    [k in keyof T]?: unknown;
  };
  export type identity<T> = T;
  export type flatten<T> = identity<{
    [k in keyof T]: T[k];
  }>;
  export type noNeverKeys<T> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];
  export type noNever<T> = identity<{
    [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
  }>;
  export const mergeShapes: <U, T>(first: U, second: T) => T & U;
  export type extendShape<A extends object, B extends object> = {
    [K in keyof A as K extends keyof B ? never : K]: A[K];
  } & {
    [K in keyof B]: B[K];
  };
  export {};
}
export declare const ZodParsedType: {
  function: "function";
  number: "number";
  string: "string";
  nan: "nan";
  integer: "integer";
  float: "float";
  boolean: "boolean";
  date: "date";
  bigint: "bigint";
  symbol: "symbol";
  undefined: "undefined";
  null: "null";
  array: "array";
  object: "object";
  unknown: "unknown";
  promise: "promise";
  void: "void";
  never: "never";
  map: "map";
  set: "set";
};
export declare type ZodParsedType = keyof typeof ZodParsedType;
export declare const getParsedType: (data: any) => ZodParsedType;
export declare type allKeys<T> = T extends any ? keyof T : never;
export declare type inferFlattenedErrors<
  T extends ZodType<any, any, any>,
  U = string
> = typeToFlattenedError<TypeOf<T>, U>;
export declare type typeToFlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: {
    [P in allKeys<T>]?: U[];
  };
};
export declare const ZodIssueCode: {
  invalid_type: "invalid_type";
  invalid_literal: "invalid_literal";
  custom: "custom";
  invalid_union: "invalid_union";
  invalid_union_discriminator: "invalid_union_discriminator";
  invalid_enum_value: "invalid_enum_value";
  unrecognized_keys: "unrecognized_keys";
  invalid_arguments: "invalid_arguments";
  invalid_return_type: "invalid_return_type";
  invalid_date: "invalid_date";
  invalid_string: "invalid_string";
  too_small: "too_small";
  too_big: "too_big";
  invalid_intersection_types: "invalid_intersection_types";
  not_multiple_of: "not_multiple_of";
  not_finite: "not_finite";
};
export declare type ZodIssueCode = keyof typeof ZodIssueCode;
export declare type ZodIssueBase = {
  path: (string | number)[];
  message?: string;
};
export interface ZodInvalidTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_type;
  expected: ZodParsedType;
  received: ZodParsedType;
}
export interface ZodInvalidLiteralIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_literal;
  expected: unknown;
  received: unknown;
}
export interface ZodUnrecognizedKeysIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.unrecognized_keys;
  keys: string[];
}
export interface ZodInvalidUnionIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union;
  unionErrors: ZodError[];
}
export interface ZodInvalidUnionDiscriminatorIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_union_discriminator;
  options: Primitive[];
}
export interface ZodInvalidEnumValueIssue extends ZodIssueBase {
  received: string | number;
  code: typeof ZodIssueCode.invalid_enum_value;
  options: (string | number)[];
}
export interface ZodInvalidArgumentsIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_arguments;
  argumentsError: ZodError;
}
export interface ZodInvalidReturnTypeIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_return_type;
  returnTypeError: ZodError;
}
export interface ZodInvalidDateIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_date;
}
export declare type StringValidation =
  | "email"
  | "url"
  | "emoji"
  | "uuid"
  | "nanoid"
  | "regex"
  | "cuid"
  | "cuid2"
  | "ulid"
  | "datetime"
  | "date"
  | "time"
  | "duration"
  | "ip"
  | "base64"
  | {
      includes: string;
      position?: number;
    }
  | {
      startsWith: string;
    }
  | {
      endsWith: string;
    };
export interface ZodInvalidStringIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_string;
  validation: StringValidation;
}
export interface ZodTooSmallIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_small;
  minimum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
  type: "array" | "string" | "number" | "set" | "date" | "bigint";
}
export interface ZodTooBigIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.too_big;
  maximum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
  type: "array" | "string" | "number" | "set" | "date" | "bigint";
}
export interface ZodInvalidIntersectionTypesIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.invalid_intersection_types;
}
export interface ZodNotMultipleOfIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.not_multiple_of;
  multipleOf: number | bigint;
}
export interface ZodNotFiniteIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.not_finite;
}
export interface ZodCustomIssue extends ZodIssueBase {
  code: typeof ZodIssueCode.custom;
  params?: {
    [k: string]: any;
  };
}
export declare type DenormalizedError = {
  [k: string]: DenormalizedError | string[];
};
export declare type ZodIssueOptionalMessage =
  | ZodInvalidTypeIssue
  | ZodInvalidLiteralIssue
  | ZodUnrecognizedKeysIssue
  | ZodInvalidUnionIssue
  | ZodInvalidUnionDiscriminatorIssue
  | ZodInvalidEnumValueIssue
  | ZodInvalidArgumentsIssue
  | ZodInvalidReturnTypeIssue
  | ZodInvalidDateIssue
  | ZodInvalidStringIssue
  | ZodTooSmallIssue
  | ZodTooBigIssue
  | ZodInvalidIntersectionTypesIssue
  | ZodNotMultipleOfIssue
  | ZodNotFiniteIssue
  | ZodCustomIssue;
export declare type ZodIssue = ZodIssueOptionalMessage & {
  fatal?: boolean;
  message: string;
};
export declare const quotelessJson: (obj: any) => string;
export declare type recursiveZodFormattedError<T> = T extends [any, ...any[]]
  ? {
      [K in keyof T]?: ZodFormattedError<T[K]>;
    }
  : T extends any[]
  ? {
      [k: number]: ZodFormattedError<T[number]>;
    }
  : T extends object
  ? {
      [K in keyof T]?: ZodFormattedError<T[K]>;
    }
  : unknown;
export declare type ZodFormattedError<T, U = string> = {
  _errors: U[];
} & recursiveZodFormattedError<NonNullable<T>>;
export declare type inferFormattedError<
  T extends ZodType<any, any, any>,
  U = string
> = ZodFormattedError<TypeOf<T>, U>;
export declare class ZodError<T = any> extends Error {
  issues: ZodIssue[];
  get errors(): ZodIssue[];
  constructor(issues: ZodIssue[]);
  format(): ZodFormattedError<T>;
  format<U>(mapper: (issue: ZodIssue) => U): ZodFormattedError<T, U>;
  static create: (issues: ZodIssue[]) => ZodError<any>;
  static assert(value: unknown): asserts value is ZodError;
  toString(): string;
  get message(): string;
  get isEmpty(): boolean;
  addIssue: (sub: ZodIssue) => void;
  addIssues: (subs?: ZodIssue[]) => void;
  flatten(): typeToFlattenedError<T>;
  flatten<U>(mapper?: (issue: ZodIssue) => U): typeToFlattenedError<T, U>;
  get formErrors(): typeToFlattenedError<T, string>;
}
export declare type stripPath<T extends object> = T extends any
  ? util.OmitKeys<T, "path">
  : never;
export declare type IssueData = stripPath<ZodIssueOptionalMessage> & {
  path?: (string | number)[];
  fatal?: boolean;
};
export declare type ErrorMapCtx = {
  defaultError: string;
  data: any;
};
export declare type ZodErrorMap = (
  issue: ZodIssueOptionalMessage,
  _ctx: ErrorMapCtx
) => {
  message: string;
};
declare const errorMap: ZodErrorMap;
export declare function setErrorMap(map: ZodErrorMap): void;
export declare function getErrorMap(): ZodErrorMap;
export declare const makeIssue: (params: {
  data: any;
  path: (string | number)[];
  errorMaps: ZodErrorMap[];
  issueData: IssueData;
}) => ZodIssue;
export declare type ParseParams = {
  path: (string | number)[];
  errorMap: ZodErrorMap;
  async: boolean;
};
export declare type ParsePathComponent = string | number;
export declare type ParsePath = ParsePathComponent[];
export declare const EMPTY_PATH: ParsePath;
export interface ParseContext {
  readonly common: {
    readonly issues: ZodIssue[];
    readonly contextualErrorMap?: ZodErrorMap;
    readonly async: boolean;
  };
  readonly path: ParsePath;
  readonly schemaErrorMap?: ZodErrorMap;
  readonly parent: ParseContext | null;
  readonly data: any;
  readonly parsedType: ZodParsedType;
}
export declare type ParseInput = {
  data: any;
  path: (string | number)[];
  parent: ParseContext;
};
export declare function addIssueToContext(
  ctx: ParseContext,
  issueData: IssueData
): void;
export declare type ObjectPair = {
  key: SyncParseReturnType<any>;
  value: SyncParseReturnType<any>;
};
export declare class ParseStatus {
  value: "aborted" | "dirty" | "valid";
  dirty(): void;
  abort(): void;
  static mergeArray(
    status: ParseStatus,
    results: SyncParseReturnType<any>[]
  ): SyncParseReturnType;
  static mergeObjectAsync(
    status: ParseStatus,
    pairs: {
      key: ParseReturnType<any>;
      value: ParseReturnType<any>;
    }[]
  ): Promise<SyncParseReturnType<any>>;
  static mergeObjectSync(
    status: ParseStatus,
    pairs: {
      key: SyncParseReturnType<any>;
      value: SyncParseReturnType<any>;
      alwaysSet?: boolean;
    }[]
  ): SyncParseReturnType;
}
export interface ParseResult {
  status: "aborted" | "dirty" | "valid";
  data: any;
}
export declare type INVALID = {
  status: "aborted";
};
export declare const INVALID: INVALID;
export declare type DIRTY<T> = {
  status: "dirty";
  value: T;
};
export declare const DIRTY: <T>(value: T) => DIRTY<T>;
export declare type OK<T> = {
  status: "valid";
  value: T;
};
export declare const OK: <T>(value: T) => OK<T>;
export declare type SyncParseReturnType<T = any> = OK<T> | DIRTY<T> | INVALID;
export declare type AsyncParseReturnType<T> = Promise<SyncParseReturnType<T>>;
export declare type ParseReturnType<T> =
  | SyncParseReturnType<T>
  | AsyncParseReturnType<T>;
export declare const isAborted: (x: ParseReturnType<any>) => x is INVALID;
export declare const isDirty: <T>(
  x: ParseReturnType<T>
) => x is OK<T> | DIRTY<T>;
export declare const isValid: <T>(x: ParseReturnType<T>) => x is OK<T>;
export declare const isAsync: <T>(
  x: ParseReturnType<T>
) => x is AsyncParseReturnType<T>;
declare namespace enumUtil {
  type UnionToIntersectionFn<T> = (
    T extends unknown ? (k: () => T) => void : never
  ) extends (k: infer Intersection) => void
    ? Intersection
    : never;
  type GetUnionLast<T> = UnionToIntersectionFn<T> extends () => infer Last
    ? Last
    : never;
  type UnionToTuple<T, Tuple extends unknown[] = []> = [T] extends [never]
    ? Tuple
    : UnionToTuple<Exclude<T, GetUnionLast<T>>, [GetUnionLast<T>, ...Tuple]>;
  type CastToStringTuple<T> = T extends [string, ...string[]] ? T : never;
  export type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;
  export {};
}
declare namespace errorUtil {
  type ErrMessage =
    | string
    | {
        message?: string;
      };
  const errToObj: (message?: ErrMessage | undefined) => {
    message?: string | undefined;
  };
  const toString: (message?: ErrMessage | undefined) => string | undefined;
}
declare namespace partialUtil {
  type DeepPartial<T extends ZodTypeAny> = T extends ZodObject<ZodRawShape>
    ? ZodObject<
        {
          [k in keyof T["shape"]]: ZodOptional<DeepPartial<T["shape"][k]>>;
        },
        T["_def"]["unknownKeys"],
        T["_def"]["catchall"]
      >
    : T extends ZodArray<infer Type, infer Card>
    ? ZodArray<DeepPartial<Type>, Card>
    : T extends ZodOptional<infer Type>
    ? ZodOptional<DeepPartial<Type>>
    : T extends ZodNullable<infer Type>
    ? ZodNullable<DeepPartial<Type>>
    : T extends ZodTuple<infer Items>
    ? {
        [k in keyof Items]: Items[k] extends ZodTypeAny
          ? DeepPartial<Items[k]>
          : never;
      } extends infer PI
      ? PI extends ZodTupleItems
        ? ZodTuple<PI>
        : never
      : never
    : T;
}
export declare type RefinementCtx = {
  addIssue: (arg: IssueData) => void;
  path: (string | number)[];
};
export declare type ZodRawShape = {
  [k: string]: ZodTypeAny;
};
export declare type ZodTypeAny = ZodType<any, any, any>;
export declare type TypeOf<T extends ZodType<any, any, any>> = T["_output"];
export declare type input<T extends ZodType<any, any, any>> = T["_input"];
export declare type output<T extends ZodType<any, any, any>> = T["_output"];
export declare type CustomErrorParams = Partial<
  util.Omit<ZodCustomIssue, "code">
>;
export interface ZodTypeDef {
  errorMap?: ZodErrorMap;
  description?: string;
}
export declare type RawCreateParams =
  | {
      errorMap?: ZodErrorMap;
      invalid_type_error?: string;
      required_error?: string;
      message?: string;
      description?: string;
    }
  | undefined;
export declare type ProcessedCreateParams = {
  errorMap?: ZodErrorMap;
  description?: string;
};
export declare type SafeParseSuccess<Output> = {
  success: true;
  data: Output;
  error?: never;
};
export declare type SafeParseError<Input> = {
  success: false;
  error: ZodError<Input>;
  data?: never;
};
export declare type SafeParseReturnType<Input, Output> =
  | SafeParseSuccess<Output>
  | SafeParseError<Input>;
export declare abstract class ZodType<
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> {
  readonly _type: Output;
  readonly _output: Output;
  readonly _input: Input;
  readonly _def: Def;
  get description(): string | undefined;
  abstract _parse(input: ParseInput): ParseReturnType<Output>;
  _getType(input: ParseInput): string;
  _getOrReturnCtx(
    input: ParseInput,
    ctx?: ParseContext | undefined
  ): ParseContext;
  _processInputParams(input: ParseInput): {
    status: ParseStatus;
    ctx: ParseContext;
  };
  _parseSync(input: ParseInput): SyncParseReturnType<Output>;
  _parseAsync(input: ParseInput): AsyncParseReturnType<Output>;
  parse(data: unknown, params?: Partial<ParseParams>): Output;
  safeParse(
    data: unknown,
    params?: Partial<ParseParams>
  ): SafeParseReturnType<Input, Output>;
  parseAsync(data: unknown, params?: Partial<ParseParams>): Promise<Output>;
  safeParseAsync(
    data: unknown,
    params?: Partial<ParseParams>
  ): Promise<SafeParseReturnType<Input, Output>>;
  /** Alias of safeParseAsync */
  spa: (
    data: unknown,
    params?: Partial<ParseParams> | undefined
  ) => Promise<SafeParseReturnType<Input, Output>>;
  refine<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, RefinedOutput, Input>;
  refine(
    check: (arg: Output) => unknown | Promise<unknown>,
    message?: string | CustomErrorParams | ((arg: Output) => CustomErrorParams)
  ): ZodEffects<this, Output, Input>;
  refinement<RefinedOutput extends Output>(
    check: (arg: Output) => arg is RefinedOutput,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, RefinedOutput, Input>;
  refinement(
    check: (arg: Output) => boolean,
    refinementData: IssueData | ((arg: Output, ctx: RefinementCtx) => IssueData)
  ): ZodEffects<this, Output, Input>;
  _refinement(
    refinement: RefinementEffect<Output>["refinement"]
  ): ZodEffects<this, Output, Input>;
  superRefine<RefinedOutput extends Output>(
    refinement: (arg: Output, ctx: RefinementCtx) => arg is RefinedOutput
  ): ZodEffects<this, RefinedOutput, Input>;
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => void
  ): ZodEffects<this, Output, Input>;
  superRefine(
    refinement: (arg: Output, ctx: RefinementCtx) => Promise<void>
  ): ZodEffects<this, Output, Input>;
  constructor(def: Def);
  optional(): ZodOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  array(): ZodArray<this>;
  promise(): ZodPromise<this>;
  or<T extends ZodTypeAny>(option: T): ZodUnion<[this, T]>;
  and<T extends ZodTypeAny>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(
    transform: (arg: Output, ctx: RefinementCtx) => NewOut | Promise<NewOut>
  ): ZodEffects<this, NewOut>;
  default(def: util.noUndefined<Input>): ZodDefault<this>;
  default(def: () => util.noUndefined<Input>): ZodDefault<this>;
  brand<B extends string | number | symbol>(brand?: B): ZodBranded<this, B>;
  catch(def: Output): ZodCatch<this>;
  catch(
    def: (ctx: { error: ZodError; input: Input }) => Output
  ): ZodCatch<this>;
  describe(description: string): this;
  pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T>;
  readonly(): ZodReadonly<this>;
  isOptional(): boolean;
  isNullable(): boolean;
}
export declare type IpVersion = "v4" | "v6";
export declare type ZodStringCheck =
  | {
      kind: "min";
      value: number;
      message?: string;
    }
  | {
      kind: "max";
      value: number;
      message?: string;
    }
  | {
      kind: "length";
      value: number;
      message?: string;
    }
  | {
      kind: "email";
      message?: string;
    }
  | {
      kind: "url";
      message?: string;
    }
  | {
      kind: "emoji";
      message?: string;
    }
  | {
      kind: "uuid";
      message?: string;
    }
  | {
      kind: "nanoid";
      message?: string;
    }
  | {
      kind: "cuid";
      message?: string;
    }
  | {
      kind: "includes";
      value: string;
      position?: number;
      message?: string;
    }
  | {
      kind: "cuid2";
      message?: string;
    }
  | {
      kind: "ulid";
      message?: string;
    }
  | {
      kind: "startsWith";
      value: string;
      message?: string;
    }
  | {
      kind: "endsWith";
      value: string;
      message?: string;
    }
  | {
      kind: "regex";
      regex: RegExp;
      message?: string;
    }
  | {
      kind: "trim";
      message?: string;
    }
  | {
      kind: "toLowerCase";
      message?: string;
    }
  | {
      kind: "toUpperCase";
      message?: string;
    }
  | {
      kind: "datetime";
      offset: boolean;
      local: boolean;
      precision: number | null;
      message?: string;
    }
  | {
      kind: "date";
      message?: string;
    }
  | {
      kind: "time";
      precision: number | null;
      message?: string;
    }
  | {
      kind: "duration";
      message?: string;
    }
  | {
      kind: "ip";
      version?: IpVersion;
      message?: string;
    }
  | {
      kind: "base64";
      message?: string;
    };
export interface ZodStringDef extends ZodTypeDef {
  checks: ZodStringCheck[];
  typeName: ZodFirstPartyTypeKind.ZodString;
  coerce: boolean;
}
export declare function datetimeRegex(args: {
  precision?: number | null;
  offset?: boolean;
  local?: boolean;
}): RegExp;
export declare class ZodString extends ZodType<string, ZodStringDef, string> {
  _parse(input: ParseInput): ParseReturnType<string>;
  protected _regex(
    regex: RegExp,
    validation: StringValidation,
    message?: errorUtil.ErrMessage
  ): ZodEffects<this, string, string>;
  _addCheck(check: ZodStringCheck): ZodString;
  email(message?: errorUtil.ErrMessage): ZodString;
  url(message?: errorUtil.ErrMessage): ZodString;
  emoji(message?: errorUtil.ErrMessage): ZodString;
  uuid(message?: errorUtil.ErrMessage): ZodString;
  nanoid(message?: errorUtil.ErrMessage): ZodString;
  cuid(message?: errorUtil.ErrMessage): ZodString;
  cuid2(message?: errorUtil.ErrMessage): ZodString;
  ulid(message?: errorUtil.ErrMessage): ZodString;
  base64(message?: errorUtil.ErrMessage): ZodString;
  ip(
    options?:
      | string
      | {
          version?: "v4" | "v6";
          message?: string;
        }
  ): ZodString;
  datetime(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
          offset?: boolean;
          local?: boolean;
        }
  ): ZodString;
  date(message?: string): ZodString;
  time(
    options?:
      | string
      | {
          message?: string | undefined;
          precision?: number | null;
        }
  ): ZodString;
  duration(message?: errorUtil.ErrMessage): ZodString;
  regex(regex: RegExp, message?: errorUtil.ErrMessage): ZodString;
  includes(
    value: string,
    options?: {
      message?: string;
      position?: number;
    }
  ): ZodString;
  startsWith(value: string, message?: errorUtil.ErrMessage): ZodString;
  endsWith(value: string, message?: errorUtil.ErrMessage): ZodString;
  min(minLength: number, message?: errorUtil.ErrMessage): ZodString;
  max(maxLength: number, message?: errorUtil.ErrMessage): ZodString;
  length(len: number, message?: errorUtil.ErrMessage): ZodString;
  /**
   * @deprecated Use z.string().min(1) instead.
   * @see {@link ZodString.min}
   */
  nonempty(message?: errorUtil.ErrMessage): ZodString;
  trim(): ZodString;
  toLowerCase(): ZodString;
  toUpperCase(): ZodString;
  get isDatetime(): boolean;
  get isDate(): boolean;
  get isTime(): boolean;
  get isDuration(): boolean;
  get isEmail(): boolean;
  get isURL(): boolean;
  get isEmoji(): boolean;
  get isUUID(): boolean;
  get isNANOID(): boolean;
  get isCUID(): boolean;
  get isCUID2(): boolean;
  get isULID(): boolean;
  get isIP(): boolean;
  get isBase64(): boolean;
  get minLength(): number | null;
  get maxLength(): number | null;
  static create: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: true | undefined;
        })
      | undefined
  ) => ZodString;
}
export declare type ZodNumberCheck =
  | {
      kind: "min";
      value: number;
      inclusive: boolean;
      message?: string;
    }
  | {
      kind: "max";
      value: number;
      inclusive: boolean;
      message?: string;
    }
  | {
      kind: "int";
      message?: string;
    }
  | {
      kind: "multipleOf";
      value: number;
      message?: string;
    }
  | {
      kind: "finite";
      message?: string;
    };
export interface ZodNumberDef extends ZodTypeDef {
  checks: ZodNumberCheck[];
  typeName: ZodFirstPartyTypeKind.ZodNumber;
  coerce: boolean;
}
export declare class ZodNumber extends ZodType<number, ZodNumberDef, number> {
  _parse(input: ParseInput): ParseReturnType<number>;
  static create: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodNumber;
  gte(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  min: (value: number, message?: errorUtil.ErrMessage | undefined) => ZodNumber;
  gt(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  lte(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  max: (value: number, message?: errorUtil.ErrMessage | undefined) => ZodNumber;
  lt(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  protected setLimit(
    kind: "min" | "max",
    value: number,
    inclusive: boolean,
    message?: string
  ): ZodNumber;
  _addCheck(check: ZodNumberCheck): ZodNumber;
  int(message?: errorUtil.ErrMessage): ZodNumber;
  positive(message?: errorUtil.ErrMessage): ZodNumber;
  negative(message?: errorUtil.ErrMessage): ZodNumber;
  nonpositive(message?: errorUtil.ErrMessage): ZodNumber;
  nonnegative(message?: errorUtil.ErrMessage): ZodNumber;
  multipleOf(value: number, message?: errorUtil.ErrMessage): ZodNumber;
  step: (
    value: number,
    message?: errorUtil.ErrMessage | undefined
  ) => ZodNumber;
  finite(message?: errorUtil.ErrMessage): ZodNumber;
  safe(message?: errorUtil.ErrMessage): ZodNumber;
  get minValue(): number | null;
  get maxValue(): number | null;
  get isInt(): boolean;
  get isFinite(): boolean;
}
export declare type ZodBigIntCheck =
  | {
      kind: "min";
      value: bigint;
      inclusive: boolean;
      message?: string;
    }
  | {
      kind: "max";
      value: bigint;
      inclusive: boolean;
      message?: string;
    }
  | {
      kind: "multipleOf";
      value: bigint;
      message?: string;
    };
export interface ZodBigIntDef extends ZodTypeDef {
  checks: ZodBigIntCheck[];
  typeName: ZodFirstPartyTypeKind.ZodBigInt;
  coerce: boolean;
}
export declare class ZodBigInt extends ZodType<bigint, ZodBigIntDef, bigint> {
  _parse(input: ParseInput): ParseReturnType<bigint>;
  static create: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodBigInt;
  gte(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  min: (value: bigint, message?: errorUtil.ErrMessage | undefined) => ZodBigInt;
  gt(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  lte(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  max: (value: bigint, message?: errorUtil.ErrMessage | undefined) => ZodBigInt;
  lt(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  protected setLimit(
    kind: "min" | "max",
    value: bigint,
    inclusive: boolean,
    message?: string
  ): ZodBigInt;
  _addCheck(check: ZodBigIntCheck): ZodBigInt;
  positive(message?: errorUtil.ErrMessage): ZodBigInt;
  negative(message?: errorUtil.ErrMessage): ZodBigInt;
  nonpositive(message?: errorUtil.ErrMessage): ZodBigInt;
  nonnegative(message?: errorUtil.ErrMessage): ZodBigInt;
  multipleOf(value: bigint, message?: errorUtil.ErrMessage): ZodBigInt;
  get minValue(): bigint | null;
  get maxValue(): bigint | null;
}
export interface ZodBooleanDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodBoolean;
  coerce: boolean;
}
export declare class ZodBoolean extends ZodType<
  boolean,
  ZodBooleanDef,
  boolean
> {
  _parse(input: ParseInput): ParseReturnType<boolean>;
  static create: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodBoolean;
}
export declare type ZodDateCheck =
  | {
      kind: "min";
      value: number;
      message?: string;
    }
  | {
      kind: "max";
      value: number;
      message?: string;
    };
export interface ZodDateDef extends ZodTypeDef {
  checks: ZodDateCheck[];
  coerce: boolean;
  typeName: ZodFirstPartyTypeKind.ZodDate;
}
export declare class ZodDate extends ZodType<Date, ZodDateDef, Date> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  _addCheck(check: ZodDateCheck): ZodDate;
  min(minDate: Date, message?: errorUtil.ErrMessage): ZodDate;
  max(maxDate: Date, message?: errorUtil.ErrMessage): ZodDate;
  get minDate(): Date | null;
  get maxDate(): Date | null;
  static create: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodDate;
}
export interface ZodSymbolDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodSymbol;
}
export declare class ZodSymbol extends ZodType<symbol, ZodSymbolDef, symbol> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: (params?: RawCreateParams) => ZodSymbol;
}
export interface ZodUndefinedDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodUndefined;
}
export declare class ZodUndefined extends ZodType<
  undefined,
  ZodUndefinedDef,
  undefined
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  params?: RawCreateParams;
  static create: (params?: RawCreateParams) => ZodUndefined;
}
export interface ZodNullDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNull;
}
export declare class ZodNull extends ZodType<null, ZodNullDef, null> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: (params?: RawCreateParams) => ZodNull;
}
export interface ZodAnyDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodAny;
}
export declare class ZodAny extends ZodType<any, ZodAnyDef, any> {
  _any: true;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: (params?: RawCreateParams) => ZodAny;
}
export interface ZodUnknownDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodUnknown;
}
export declare class ZodUnknown extends ZodType<
  unknown,
  ZodUnknownDef,
  unknown
> {
  _unknown: true;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: (params?: RawCreateParams) => ZodUnknown;
}
export interface ZodNeverDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNever;
}
export declare class ZodNever extends ZodType<never, ZodNeverDef, never> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: (params?: RawCreateParams) => ZodNever;
}
export interface ZodVoidDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodVoid;
}
export declare class ZodVoid extends ZodType<void, ZodVoidDef, void> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: (params?: RawCreateParams) => ZodVoid;
}
export interface ZodArrayDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodArray;
  exactLength: {
    value: number;
    message?: string;
  } | null;
  minLength: {
    value: number;
    message?: string;
  } | null;
  maxLength: {
    value: number;
    message?: string;
  } | null;
}
export declare type ArrayCardinality = "many" | "atleastone";
export declare type arrayOutputType<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = "many"
> = Cardinality extends "atleastone"
  ? [T["_output"], ...T["_output"][]]
  : T["_output"][];
export declare class ZodArray<
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = "many"
> extends ZodType<
  arrayOutputType<T, Cardinality>,
  ZodArrayDef<T>,
  Cardinality extends "atleastone"
    ? [T["_input"], ...T["_input"][]]
    : T["_input"][]
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get element(): T;
  min(minLength: number, message?: errorUtil.ErrMessage): this;
  max(maxLength: number, message?: errorUtil.ErrMessage): this;
  length(len: number, message?: errorUtil.ErrMessage): this;
  nonempty(message?: errorUtil.ErrMessage): ZodArray<T, "atleastone">;
  static create: <T_1 extends ZodTypeAny>(
    schema: T_1,
    params?: RawCreateParams
  ) => ZodArray<T_1, "many">;
}
export declare type ZodNonEmptyArray<T extends ZodTypeAny> = ZodArray<
  T,
  "atleastone"
>;
export declare type UnknownKeysParam = "passthrough" | "strict" | "strip";
export interface ZodObjectDef<
  T extends ZodRawShape = ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodObject;
  shape: () => T;
  catchall: Catchall;
  unknownKeys: UnknownKeys;
}
export declare type mergeTypes<A, B> = {
  [k in keyof A | keyof B]: k extends keyof B
    ? B[k]
    : k extends keyof A
    ? A[k]
    : never;
};
export declare type objectOutputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
> = objectUtil.flatten<
  objectUtil.addQuestionMarks<baseObjectOutputType<Shape>>
> &
  CatchallOutput<Catchall> &
  PassthroughType<UnknownKeys>;
export declare type baseObjectOutputType<Shape extends ZodRawShape> = {
  [k in keyof Shape]: Shape[k]["_output"];
};
export declare type objectInputType<
  Shape extends ZodRawShape,
  Catchall extends ZodTypeAny,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam
> = objectUtil.flatten<baseObjectInputType<Shape>> &
  CatchallInput<Catchall> &
  PassthroughType<UnknownKeys>;
export declare type baseObjectInputType<Shape extends ZodRawShape> =
  objectUtil.addQuestionMarks<{
    [k in keyof Shape]: Shape[k]["_input"];
  }>;
export declare type CatchallOutput<T extends ZodType> = ZodType extends T
  ? unknown
  : {
      [k: string]: T["_output"];
    };
export declare type CatchallInput<T extends ZodType> = ZodType extends T
  ? unknown
  : {
      [k: string]: T["_input"];
    };
export declare type PassthroughType<T extends UnknownKeysParam> =
  T extends "passthrough"
    ? {
        [k: string]: unknown;
      }
    : unknown;
export declare type deoptional<T extends ZodTypeAny> = T extends ZodOptional<
  infer U
>
  ? deoptional<U>
  : T extends ZodNullable<infer U>
  ? ZodNullable<deoptional<U>>
  : T;
export declare type SomeZodObject = ZodObject<
  ZodRawShape,
  UnknownKeysParam,
  ZodTypeAny
>;
export declare type noUnrecognized<Obj extends object, Shape extends object> = {
  [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
};
export declare class ZodObject<
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>
> extends ZodType<Output, ZodObjectDef<T, UnknownKeys, Catchall>, Input> {
  private _cached;
  _getCached(): {
    shape: T;
    keys: string[];
  };
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get shape(): T;
  strict(message?: errorUtil.ErrMessage): ZodObject<T, "strict", Catchall>;
  strip(): ZodObject<T, "strip", Catchall>;
  passthrough(): ZodObject<T, "passthrough", Catchall>;
  /**
   * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
   * If you want to pass through unknown properties, use `.passthrough()` instead.
   */
  nonstrict: () => ZodObject<T, "passthrough", Catchall>;
  extend<Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ): ZodObject<objectUtil.extendShape<T, Augmentation>, UnknownKeys, Catchall>;
  /**
   * @deprecated Use `.extend` instead
   *  */
  augment: <Augmentation extends ZodRawShape>(
    augmentation: Augmentation
  ) => ZodObject<
    objectUtil.extendShape<T, Augmentation>,
    UnknownKeys,
    Catchall,
    objectOutputType<
      objectUtil.extendShape<T, Augmentation>,
      Catchall,
      UnknownKeys
    >,
    objectInputType<
      objectUtil.extendShape<T, Augmentation>,
      Catchall,
      UnknownKeys
    >
  >;
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge<Incoming extends AnyZodObject, Augmentation extends Incoming["shape"]>(
    merging: Incoming
  ): ZodObject<
    objectUtil.extendShape<T, Augmentation>,
    Incoming["_def"]["unknownKeys"],
    Incoming["_def"]["catchall"]
  >;
  setKey<Key extends string, Schema extends ZodTypeAny>(
    key: Key,
    schema: Schema
  ): ZodObject<
    T & {
      [k in Key]: Schema;
    },
    UnknownKeys,
    Catchall
  >;
  catchall<Index extends ZodTypeAny>(
    index: Index
  ): ZodObject<T, UnknownKeys, Index>;
  pick<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(
    mask: Mask
  ): ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall>;
  omit<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(mask: Mask): ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall>;
  /**
   * @deprecated
   */
  deepPartial(): partialUtil.DeepPartial<this>;
  partial(): ZodObject<
    {
      [k in keyof T]: ZodOptional<T[k]>;
    },
    UnknownKeys,
    Catchall
  >;
  partial<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{
      [k in keyof T]: k extends keyof Mask ? ZodOptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  required(): ZodObject<
    {
      [k in keyof T]: deoptional<T[k]>;
    },
    UnknownKeys,
    Catchall
  >;
  required<
    Mask extends util.Exactly<
      {
        [k in keyof T]?: true;
      },
      Mask
    >
  >(
    mask: Mask
  ): ZodObject<
    objectUtil.noNever<{
      [k in keyof T]: k extends keyof Mask ? deoptional<T[k]> : T[k];
    }>,
    UnknownKeys,
    Catchall
  >;
  keyof(): ZodEnum<enumUtil.UnionToTupleString<keyof T>>;
  static create: <T_1 extends ZodRawShape>(
    shape: T_1,
    params?: RawCreateParams
  ) => ZodObject<
    T_1,
    "strip",
    ZodTypeAny,
    {
      [k in keyof objectUtil.addQuestionMarks<
        baseObjectOutputType<T_1>,
        any
      >]: objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, any>[k];
    },
    {
      [k_1 in keyof baseObjectInputType<T_1>]: baseObjectInputType<T_1>[k_1];
    }
  >;
  static strictCreate: <T_1 extends ZodRawShape>(
    shape: T_1,
    params?: RawCreateParams
  ) => ZodObject<
    T_1,
    "strict",
    ZodTypeAny,
    {
      [k in keyof objectUtil.addQuestionMarks<
        baseObjectOutputType<T_1>,
        any
      >]: objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, any>[k];
    },
    {
      [k_1 in keyof baseObjectInputType<T_1>]: baseObjectInputType<T_1>[k_1];
    }
  >;
  static lazycreate: <T_1 extends ZodRawShape>(
    shape: () => T_1,
    params?: RawCreateParams
  ) => ZodObject<
    T_1,
    "strip",
    ZodTypeAny,
    {
      [k in keyof objectUtil.addQuestionMarks<
        baseObjectOutputType<T_1>,
        any
      >]: objectUtil.addQuestionMarks<baseObjectOutputType<T_1>, any>[k];
    },
    {
      [k_1 in keyof baseObjectInputType<T_1>]: baseObjectInputType<T_1>[k_1];
    }
  >;
}
export declare type AnyZodObject = ZodObject<any, any, any>;
export declare type ZodUnionOptions = Readonly<[ZodTypeAny, ...ZodTypeAny[]]>;
export interface ZodUnionDef<
  T extends ZodUnionOptions = Readonly<
    [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
  >
> extends ZodTypeDef {
  options: T;
  typeName: ZodFirstPartyTypeKind.ZodUnion;
}
export declare class ZodUnion<T extends ZodUnionOptions> extends ZodType<
  T[number]["_output"],
  ZodUnionDef<T>,
  T[number]["_input"]
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get options(): T;
  static create: <
    T_1 extends readonly [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
  >(
    types: T_1,
    params?: RawCreateParams
  ) => ZodUnion<T_1>;
}
export declare type ZodDiscriminatedUnionOption<Discriminator extends string> =
  ZodObject<
    {
      [key in Discriminator]: ZodTypeAny;
    } & ZodRawShape,
    UnknownKeysParam,
    ZodTypeAny
  >;
export interface ZodDiscriminatedUnionDef<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<string>[] = ZodDiscriminatedUnionOption<string>[]
> extends ZodTypeDef {
  discriminator: Discriminator;
  options: Options;
  optionsMap: Map<Primitive, ZodDiscriminatedUnionOption<any>>;
  typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion;
}
export declare class ZodDiscriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[]
> extends ZodType<
  output<Options[number]>,
  ZodDiscriminatedUnionDef<Discriminator, Options>,
  input<Options[number]>
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get discriminator(): Discriminator;
  get options(): Options;
  get optionsMap(): Map<Primitive, ZodDiscriminatedUnionOption<any>>;
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create<
    Discriminator extends string,
    Types extends [
      ZodDiscriminatedUnionOption<Discriminator>,
      ...ZodDiscriminatedUnionOption<Discriminator>[]
    ]
  >(
    discriminator: Discriminator,
    options: Types,
    params?: RawCreateParams
  ): ZodDiscriminatedUnion<Discriminator, Types>;
}
export interface ZodIntersectionDef<
  T extends ZodTypeAny = ZodTypeAny,
  U extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  left: T;
  right: U;
  typeName: ZodFirstPartyTypeKind.ZodIntersection;
}
export declare class ZodIntersection<
  T extends ZodTypeAny,
  U extends ZodTypeAny
> extends ZodType<
  T["_output"] & U["_output"],
  ZodIntersectionDef<T, U>,
  T["_input"] & U["_input"]
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: <T_1 extends ZodTypeAny, U_1 extends ZodTypeAny>(
    left: T_1,
    right: U_1,
    params?: RawCreateParams
  ) => ZodIntersection<T_1, U_1>;
}
export declare type ZodTupleItems = [ZodTypeAny, ...ZodTypeAny[]];
export declare type AssertArray<T> = T extends any[] ? T : never;
export declare type OutputTypeOfTuple<T extends ZodTupleItems | []> =
  AssertArray<{
    [k in keyof T]: T[k] extends ZodType<any, any, any>
      ? T[k]["_output"]
      : never;
  }>;
export declare type OutputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny
  ? [...OutputTypeOfTuple<T>, ...Rest["_output"][]]
  : OutputTypeOfTuple<T>;
export declare type InputTypeOfTuple<T extends ZodTupleItems | []> =
  AssertArray<{
    [k in keyof T]: T[k] extends ZodType<any, any, any>
      ? T[k]["_input"]
      : never;
  }>;
export declare type InputTypeOfTupleWithRest<
  T extends ZodTupleItems | [],
  Rest extends ZodTypeAny | null = null
> = Rest extends ZodTypeAny
  ? [...InputTypeOfTuple<T>, ...Rest["_input"][]]
  : InputTypeOfTuple<T>;
export interface ZodTupleDef<
  T extends ZodTupleItems | [] = ZodTupleItems,
  Rest extends ZodTypeAny | null = null
> extends ZodTypeDef {
  items: T;
  rest: Rest;
  typeName: ZodFirstPartyTypeKind.ZodTuple;
}
export declare type AnyZodTuple = ZodTuple<
  [ZodTypeAny, ...ZodTypeAny[]] | [],
  ZodTypeAny | null
>;
export declare class ZodTuple<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [] = [ZodTypeAny, ...ZodTypeAny[]],
  Rest extends ZodTypeAny | null = null
> extends ZodType<
  OutputTypeOfTupleWithRest<T, Rest>,
  ZodTupleDef<T, Rest>,
  InputTypeOfTupleWithRest<T, Rest>
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get items(): T;
  rest<Rest extends ZodTypeAny>(rest: Rest): ZodTuple<T, Rest>;
  static create: <T_1 extends [] | [ZodTypeAny, ...ZodTypeAny[]]>(
    schemas: T_1,
    params?: RawCreateParams
  ) => ZodTuple<T_1, null>;
}
export interface ZodRecordDef<
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodRecord;
}
export declare type KeySchema = ZodType<string | number | symbol, any, any>;
export declare type RecordType<K extends string | number | symbol, V> = [
  string
] extends [K]
  ? Record<K, V>
  : [number] extends [K]
  ? Record<K, V>
  : [symbol] extends [K]
  ? Record<K, V>
  : [BRAND<string | number | symbol>] extends [K]
  ? Record<K, V>
  : Partial<Record<K, V>>;
export declare class ZodRecord<
  Key extends KeySchema = ZodString,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  RecordType<Key["_output"], Value["_output"]>,
  ZodRecordDef<Key, Value>,
  RecordType<Key["_input"], Value["_input"]>
> {
  get keySchema(): Key;
  get valueSchema(): Value;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get element(): Value;
  static create<Value extends ZodTypeAny>(
    valueType: Value,
    params?: RawCreateParams
  ): ZodRecord<ZodString, Value>;
  static create<Keys extends KeySchema, Value extends ZodTypeAny>(
    keySchema: Keys,
    valueType: Value,
    params?: RawCreateParams
  ): ZodRecord<Keys, Value>;
}
export interface ZodMapDef<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  valueType: Value;
  keyType: Key;
  typeName: ZodFirstPartyTypeKind.ZodMap;
}
export declare class ZodMap<
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  Map<Key["_output"], Value["_output"]>,
  ZodMapDef<Key, Value>,
  Map<Key["_input"], Value["_input"]>
> {
  get keySchema(): Key;
  get valueSchema(): Value;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: <
    Key_1 extends ZodTypeAny = ZodTypeAny,
    Value_1 extends ZodTypeAny = ZodTypeAny
  >(
    keyType: Key_1,
    valueType: Value_1,
    params?: RawCreateParams
  ) => ZodMap<Key_1, Value_1>;
}
export interface ZodSetDef<Value extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  valueType: Value;
  typeName: ZodFirstPartyTypeKind.ZodSet;
  minSize: {
    value: number;
    message?: string;
  } | null;
  maxSize: {
    value: number;
    message?: string;
  } | null;
}
export declare class ZodSet<
  Value extends ZodTypeAny = ZodTypeAny
> extends ZodType<
  Set<Value["_output"]>,
  ZodSetDef<Value>,
  Set<Value["_input"]>
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  min(minSize: number, message?: errorUtil.ErrMessage): this;
  max(maxSize: number, message?: errorUtil.ErrMessage): this;
  size(size: number, message?: errorUtil.ErrMessage): this;
  nonempty(message?: errorUtil.ErrMessage): ZodSet<Value>;
  static create: <Value_1 extends ZodTypeAny = ZodTypeAny>(
    valueType: Value_1,
    params?: RawCreateParams
  ) => ZodSet<Value_1>;
}
export interface ZodFunctionDef<
  Args extends ZodTuple<any, any> = ZodTuple<any, any>,
  Returns extends ZodTypeAny = ZodTypeAny
> extends ZodTypeDef {
  args: Args;
  returns: Returns;
  typeName: ZodFirstPartyTypeKind.ZodFunction;
}
export declare type OuterTypeOfFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny
> = Args["_input"] extends Array<any>
  ? (...args: Args["_input"]) => Returns["_output"]
  : never;
export declare type InnerTypeOfFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny
> = Args["_output"] extends Array<any>
  ? (...args: Args["_output"]) => Returns["_input"]
  : never;
export declare class ZodFunction<
  Args extends ZodTuple<any, any>,
  Returns extends ZodTypeAny
> extends ZodType<
  OuterTypeOfFunction<Args, Returns>,
  ZodFunctionDef<Args, Returns>,
  InnerTypeOfFunction<Args, Returns>
> {
  _parse(input: ParseInput): ParseReturnType<any>;
  parameters(): Args;
  returnType(): Returns;
  args<Items extends Parameters<(typeof ZodTuple)["create"]>[0]>(
    ...items: Items
  ): ZodFunction<ZodTuple<Items, ZodUnknown>, Returns>;
  returns<NewReturnType extends ZodType<any, any, any>>(
    returnType: NewReturnType
  ): ZodFunction<Args, NewReturnType>;
  implement<F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ): ReturnType<F> extends Returns["_output"]
    ? (...args: Args["_input"]) => ReturnType<F>
    : OuterTypeOfFunction<Args, Returns>;
  strictImplement(
    func: InnerTypeOfFunction<Args, Returns>
  ): InnerTypeOfFunction<Args, Returns>;
  validate: <F extends InnerTypeOfFunction<Args, Returns>>(
    func: F
  ) => ReturnType<F> extends Returns["_output"]
    ? (...args: Args["_input"]) => ReturnType<F>
    : OuterTypeOfFunction<Args, Returns>;
  static create(): ZodFunction<ZodTuple<[], ZodUnknown>, ZodUnknown>;
  static create<T extends AnyZodTuple = ZodTuple<[], ZodUnknown>>(
    args: T
  ): ZodFunction<T, ZodUnknown>;
  static create<T extends AnyZodTuple, U extends ZodTypeAny>(
    args: T,
    returns: U
  ): ZodFunction<T, U>;
  static create<
    T extends AnyZodTuple = ZodTuple<[], ZodUnknown>,
    U extends ZodTypeAny = ZodUnknown
  >(args: T, returns: U, params?: RawCreateParams): ZodFunction<T, U>;
}
export interface ZodLazyDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  getter: () => T;
  typeName: ZodFirstPartyTypeKind.ZodLazy;
}
export declare class ZodLazy<T extends ZodTypeAny> extends ZodType<
  output<T>,
  ZodLazyDef<T>,
  input<T>
> {
  get schema(): T;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: <T_1 extends ZodTypeAny>(
    getter: () => T_1,
    params?: RawCreateParams
  ) => ZodLazy<T_1>;
}
export interface ZodLiteralDef<T = any> extends ZodTypeDef {
  value: T;
  typeName: ZodFirstPartyTypeKind.ZodLiteral;
}
export declare class ZodLiteral<T> extends ZodType<T, ZodLiteralDef<T>, T> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get value(): T;
  static create: <T_1 extends Primitive>(
    value: T_1,
    params?: RawCreateParams
  ) => ZodLiteral<T_1>;
}
export declare type ArrayKeys = keyof any[];
export declare type Indices<T> = Exclude<keyof T, ArrayKeys>;
export declare type EnumValues<T extends string = string> = readonly [
  T,
  ...T[]
];
export declare type Values<T extends EnumValues> = {
  [k in T[number]]: k;
};
export interface ZodEnumDef<T extends EnumValues = EnumValues>
  extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodEnum;
}
export declare type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};
export declare type FilterEnum<Values, ToExclude> = Values extends []
  ? []
  : Values extends [infer Head, ...infer Rest]
  ? Head extends ToExclude
    ? FilterEnum<Rest, ToExclude>
    : [Head, ...FilterEnum<Rest, ToExclude>]
  : never;
export declare type typecast<A, T> = A extends T ? A : never;
declare function createZodEnum<
  U extends string,
  T extends Readonly<[U, ...U[]]>
>(values: T, params?: RawCreateParams): ZodEnum<Writeable<T>>;
declare function createZodEnum<U extends string, T extends [U, ...U[]]>(
  values: T,
  params?: RawCreateParams
): ZodEnum<T>;
export declare class ZodEnum<T extends [string, ...string[]]> extends ZodType<
  T[number],
  ZodEnumDef<T>,
  T[number]
> {
  #private;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  get options(): T;
  get enum(): Values<T>;
  get Values(): Values<T>;
  get Enum(): Values<T>;
  extract<ToExtract extends readonly [T[number], ...T[number][]]>(
    values: ToExtract,
    newDef?: RawCreateParams
  ): ZodEnum<Writeable<ToExtract>>;
  exclude<ToExclude extends readonly [T[number], ...T[number][]]>(
    values: ToExclude,
    newDef?: RawCreateParams
  ): ZodEnum<
    typecast<Writeable<FilterEnum<T, ToExclude[number]>>, [string, ...string[]]>
  >;
  static create: typeof createZodEnum;
}
export interface ZodNativeEnumDef<T extends EnumLike = EnumLike>
  extends ZodTypeDef {
  values: T;
  typeName: ZodFirstPartyTypeKind.ZodNativeEnum;
}
export declare type EnumLike = {
  [k: string]: string | number;
  [nu: number]: string;
};
export declare class ZodNativeEnum<T extends EnumLike> extends ZodType<
  T[keyof T],
  ZodNativeEnumDef<T>,
  T[keyof T]
> {
  #private;
  _parse(input: ParseInput): ParseReturnType<T[keyof T]>;
  get enum(): T;
  static create: <T_1 extends EnumLike>(
    values: T_1,
    params?: RawCreateParams
  ) => ZodNativeEnum<T_1>;
}
export interface ZodPromiseDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodPromise;
}
export declare class ZodPromise<T extends ZodTypeAny> extends ZodType<
  Promise<T["_output"]>,
  ZodPromiseDef<T>,
  Promise<T["_input"]>
> {
  unwrap(): T;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: <T_1 extends ZodTypeAny>(
    schema: T_1,
    params?: RawCreateParams
  ) => ZodPromise<T_1>;
}
export declare type Refinement<T> = (arg: T, ctx: RefinementCtx) => any;
export declare type SuperRefinement<T> = (
  arg: T,
  ctx: RefinementCtx
) => void | Promise<void>;
export declare type RefinementEffect<T> = {
  type: "refinement";
  refinement: (arg: T, ctx: RefinementCtx) => any;
};
export declare type TransformEffect<T> = {
  type: "transform";
  transform: (arg: T, ctx: RefinementCtx) => any;
};
export declare type PreprocessEffect<T> = {
  type: "preprocess";
  transform: (arg: T, ctx: RefinementCtx) => any;
};
export declare type Effect<T> =
  | RefinementEffect<T>
  | TransformEffect<T>
  | PreprocessEffect<T>;
export interface ZodEffectsDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  schema: T;
  typeName: ZodFirstPartyTypeKind.ZodEffects;
  effect: Effect<any>;
}
export declare class ZodEffects<
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>
> extends ZodType<Output, ZodEffectsDef<T>, Input> {
  innerType(): T;
  sourceType(): T;
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: <I extends ZodTypeAny>(
    schema: I,
    effect: Effect<I["_output"]>,
    params?: RawCreateParams
  ) => ZodEffects<I, I["_output"], input<I>>;
  static createWithPreprocess: <I extends ZodTypeAny>(
    preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
    schema: I,
    params?: RawCreateParams
  ) => ZodEffects<I, I["_output"], unknown>;
}
export interface ZodOptionalDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodOptional;
}
export declare type ZodOptionalType<T extends ZodTypeAny> = ZodOptional<T>;
export declare class ZodOptional<T extends ZodTypeAny> extends ZodType<
  T["_output"] | undefined,
  ZodOptionalDef<T>,
  T["_input"] | undefined
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  unwrap(): T;
  static create: <T_1 extends ZodTypeAny>(
    type: T_1,
    params?: RawCreateParams
  ) => ZodOptional<T_1>;
}
export interface ZodNullableDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodNullable;
}
export declare type ZodNullableType<T extends ZodTypeAny> = ZodNullable<T>;
export declare class ZodNullable<T extends ZodTypeAny> extends ZodType<
  T["_output"] | null,
  ZodNullableDef<T>,
  T["_input"] | null
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  unwrap(): T;
  static create: <T_1 extends ZodTypeAny>(
    type: T_1,
    params?: RawCreateParams
  ) => ZodNullable<T_1>;
}
export interface ZodDefaultDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  defaultValue: () => util.noUndefined<T["_input"]>;
  typeName: ZodFirstPartyTypeKind.ZodDefault;
}
export declare class ZodDefault<T extends ZodTypeAny> extends ZodType<
  util.noUndefined<T["_output"]>,
  ZodDefaultDef<T>,
  T["_input"] | undefined
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  removeDefault(): T;
  static create: <T_1 extends ZodTypeAny>(
    type: T_1,
    params: {
      errorMap?: ZodErrorMap | undefined;
      invalid_type_error?: string | undefined;
      required_error?: string | undefined;
      message?: string | undefined;
      description?: string | undefined;
    } & {
      default: T_1["_input"] | (() => util.noUndefined<T_1["_input"]>);
    }
  ) => ZodDefault<T_1>;
}
export interface ZodCatchDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  catchValue: (ctx: { error: ZodError; input: unknown }) => T["_input"];
  typeName: ZodFirstPartyTypeKind.ZodCatch;
}
export declare class ZodCatch<T extends ZodTypeAny> extends ZodType<
  T["_output"],
  ZodCatchDef<T>,
  unknown
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  removeCatch(): T;
  static create: <T_1 extends ZodTypeAny>(
    type: T_1,
    params: {
      errorMap?: ZodErrorMap | undefined;
      invalid_type_error?: string | undefined;
      required_error?: string | undefined;
      message?: string | undefined;
      description?: string | undefined;
    } & {
      catch: T_1["_output"] | (() => T_1["_output"]);
    }
  ) => ZodCatch<T_1>;
}
export interface ZodNaNDef extends ZodTypeDef {
  typeName: ZodFirstPartyTypeKind.ZodNaN;
}
export declare class ZodNaN extends ZodType<number, ZodNaNDef, number> {
  _parse(input: ParseInput): ParseReturnType<any>;
  static create: (params?: RawCreateParams) => ZodNaN;
}
export interface ZodBrandedDef<T extends ZodTypeAny> extends ZodTypeDef {
  type: T;
  typeName: ZodFirstPartyTypeKind.ZodBranded;
}
export declare const BRAND: unique symbol;
export declare type BRAND<T extends string | number | symbol> = {
  [BRAND]: {
    [k in T]: true;
  };
};
export declare class ZodBranded<
  T extends ZodTypeAny,
  B extends string | number | symbol
> extends ZodType<T["_output"] & BRAND<B>, ZodBrandedDef<T>, T["_input"]> {
  _parse(input: ParseInput): ParseReturnType<any>;
  unwrap(): T;
}
export interface ZodPipelineDef<A extends ZodTypeAny, B extends ZodTypeAny>
  extends ZodTypeDef {
  in: A;
  out: B;
  typeName: ZodFirstPartyTypeKind.ZodPipeline;
}
export declare class ZodPipeline<
  A extends ZodTypeAny,
  B extends ZodTypeAny
> extends ZodType<B["_output"], ZodPipelineDef<A, B>, A["_input"]> {
  _parse(input: ParseInput): ParseReturnType<any>;
  static create<A extends ZodTypeAny, B extends ZodTypeAny>(
    a: A,
    b: B
  ): ZodPipeline<A, B>;
}
export declare type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | {
      readonly [Symbol.toStringTag]: string;
    }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;
export declare type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
  ? ReadonlySet<V>
  : T extends [infer Head, ...infer Tail]
  ? readonly [Head, ...Tail]
  : T extends Array<infer V>
  ? ReadonlyArray<V>
  : T extends BuiltIn
  ? T
  : Readonly<T>;
export interface ZodReadonlyDef<T extends ZodTypeAny = ZodTypeAny>
  extends ZodTypeDef {
  innerType: T;
  typeName: ZodFirstPartyTypeKind.ZodReadonly;
}
export declare class ZodReadonly<T extends ZodTypeAny> extends ZodType<
  MakeReadonly<T["_output"]>,
  ZodReadonlyDef<T>,
  MakeReadonly<T["_input"]>
> {
  _parse(input: ParseInput): ParseReturnType<this["_output"]>;
  static create: <T_1 extends ZodTypeAny>(
    type: T_1,
    params?: RawCreateParams
  ) => ZodReadonly<T_1>;
  unwrap(): T;
}
export declare type CustomParams = CustomErrorParams & {
  fatal?: boolean;
};
export declare function custom<T>(
  check?: (data: any) => any,
  params?: string | CustomParams | ((input: any) => CustomParams),
  /**
   * @deprecated
   *
   * Pass `fatal` into the params object instead:
   *
   * ```ts
   * z.string().custom((val) => val.length > 5, { fatal: false })
   * ```
   *
   */
  fatal?: boolean
): ZodType<T, ZodTypeDef, T>;
export declare const late: {
  object: <T extends ZodRawShape>(
    shape: () => T,
    params?: RawCreateParams
  ) => ZodObject<
    T,
    "strip",
    ZodTypeAny,
    {
      [k in keyof objectUtil.addQuestionMarks<
        baseObjectOutputType<T>,
        any
      >]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, any>[k];
    },
    {
      [k_1 in keyof baseObjectInputType<T>]: baseObjectInputType<T>[k_1];
    }
  >;
};
export declare enum ZodFirstPartyTypeKind {
  ZodString = "ZodString",
  ZodNumber = "ZodNumber",
  ZodNaN = "ZodNaN",
  ZodBigInt = "ZodBigInt",
  ZodBoolean = "ZodBoolean",
  ZodDate = "ZodDate",
  ZodSymbol = "ZodSymbol",
  ZodUndefined = "ZodUndefined",
  ZodNull = "ZodNull",
  ZodAny = "ZodAny",
  ZodUnknown = "ZodUnknown",
  ZodNever = "ZodNever",
  ZodVoid = "ZodVoid",
  ZodArray = "ZodArray",
  ZodObject = "ZodObject",
  ZodUnion = "ZodUnion",
  ZodDiscriminatedUnion = "ZodDiscriminatedUnion",
  ZodIntersection = "ZodIntersection",
  ZodTuple = "ZodTuple",
  ZodRecord = "ZodRecord",
  ZodMap = "ZodMap",
  ZodSet = "ZodSet",
  ZodFunction = "ZodFunction",
  ZodLazy = "ZodLazy",
  ZodLiteral = "ZodLiteral",
  ZodEnum = "ZodEnum",
  ZodEffects = "ZodEffects",
  ZodNativeEnum = "ZodNativeEnum",
  ZodOptional = "ZodOptional",
  ZodNullable = "ZodNullable",
  ZodDefault = "ZodDefault",
  ZodCatch = "ZodCatch",
  ZodPromise = "ZodPromise",
  ZodBranded = "ZodBranded",
  ZodPipeline = "ZodPipeline",
  ZodReadonly = "ZodReadonly",
}
export declare type ZodFirstPartySchemaTypes =
  | ZodString
  | ZodNumber
  | ZodNaN
  | ZodBigInt
  | ZodBoolean
  | ZodDate
  | ZodUndefined
  | ZodNull
  | ZodAny
  | ZodUnknown
  | ZodNever
  | ZodVoid
  | ZodArray<any, any>
  | ZodObject<any, any, any>
  | ZodUnion<any>
  | ZodDiscriminatedUnion<any, any>
  | ZodIntersection<any, any>
  | ZodTuple<any, any>
  | ZodRecord<any, any>
  | ZodMap<any>
  | ZodSet<any>
  | ZodFunction<any, any>
  | ZodLazy<any>
  | ZodLiteral<any>
  | ZodEnum<any>
  | ZodEffects<any, any, any>
  | ZodNativeEnum<any>
  | ZodOptional<any>
  | ZodNullable<any>
  | ZodDefault<any>
  | ZodCatch<any>
  | ZodPromise<any>
  | ZodBranded<any, any>
  | ZodPipeline<any, any>
  | ZodReadonly<any>
  | ZodSymbol;
declare abstract class Class {
  constructor(..._: any[]);
}
declare const instanceOfType: <T extends typeof Class>(
  cls: T,
  params?: CustomParams
) => ZodType<InstanceType<T>, ZodTypeDef, InstanceType<T>>;
declare const stringType: (
  params?:
    | ({
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        message?: string | undefined;
        description?: string | undefined;
      } & {
        coerce?: true | undefined;
      })
    | undefined
) => ZodString;
declare const numberType: (
  params?:
    | ({
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        message?: string | undefined;
        description?: string | undefined;
      } & {
        coerce?: boolean | undefined;
      })
    | undefined
) => ZodNumber;
declare const nanType: (params?: RawCreateParams) => ZodNaN;
declare const bigIntType: (
  params?:
    | ({
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        message?: string | undefined;
        description?: string | undefined;
      } & {
        coerce?: boolean | undefined;
      })
    | undefined
) => ZodBigInt;
declare const booleanType: (
  params?:
    | ({
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        message?: string | undefined;
        description?: string | undefined;
      } & {
        coerce?: boolean | undefined;
      })
    | undefined
) => ZodBoolean;
declare const dateType: (
  params?:
    | ({
        errorMap?: ZodErrorMap | undefined;
        invalid_type_error?: string | undefined;
        required_error?: string | undefined;
        message?: string | undefined;
        description?: string | undefined;
      } & {
        coerce?: boolean | undefined;
      })
    | undefined
) => ZodDate;
declare const symbolType: (params?: RawCreateParams) => ZodSymbol;
declare const undefinedType: (params?: RawCreateParams) => ZodUndefined;
declare const nullType: (params?: RawCreateParams) => ZodNull;
declare const anyType: (params?: RawCreateParams) => ZodAny;
declare const unknownType: (params?: RawCreateParams) => ZodUnknown;
declare const neverType: (params?: RawCreateParams) => ZodNever;
declare const voidType: (params?: RawCreateParams) => ZodVoid;
declare const arrayType: <T extends ZodTypeAny>(
  schema: T,
  params?: RawCreateParams
) => ZodArray<T, "many">;
declare const objectType: <T extends ZodRawShape>(
  shape: T,
  params?: RawCreateParams
) => ZodObject<
  T,
  "strip",
  ZodTypeAny,
  {
    [k in keyof objectUtil.addQuestionMarks<
      baseObjectOutputType<T>,
      any
    >]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, any>[k];
  },
  {
    [k_1 in keyof baseObjectInputType<T>]: baseObjectInputType<T>[k_1];
  }
>;
declare const strictObjectType: <T extends ZodRawShape>(
  shape: T,
  params?: RawCreateParams
) => ZodObject<
  T,
  "strict",
  ZodTypeAny,
  {
    [k in keyof objectUtil.addQuestionMarks<
      baseObjectOutputType<T>,
      any
    >]: objectUtil.addQuestionMarks<baseObjectOutputType<T>, any>[k];
  },
  {
    [k_1 in keyof baseObjectInputType<T>]: baseObjectInputType<T>[k_1];
  }
>;
declare const unionType: <
  T extends readonly [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]
>(
  types: T,
  params?: RawCreateParams
) => ZodUnion<T>;
declare const discriminatedUnionType: typeof ZodDiscriminatedUnion.create;
declare const intersectionType: <T extends ZodTypeAny, U extends ZodTypeAny>(
  left: T,
  right: U,
  params?: RawCreateParams
) => ZodIntersection<T, U>;
declare const tupleType: <T extends [] | [ZodTypeAny, ...ZodTypeAny[]]>(
  schemas: T,
  params?: RawCreateParams
) => ZodTuple<T, null>;
declare const recordType: typeof ZodRecord.create;
declare const mapType: <
  Key extends ZodTypeAny = ZodTypeAny,
  Value extends ZodTypeAny = ZodTypeAny
>(
  keyType: Key,
  valueType: Value,
  params?: RawCreateParams
) => ZodMap<Key, Value>;
declare const setType: <Value extends ZodTypeAny = ZodTypeAny>(
  valueType: Value,
  params?: RawCreateParams
) => ZodSet<Value>;
declare const functionType: typeof ZodFunction.create;
declare const lazyType: <T extends ZodTypeAny>(
  getter: () => T,
  params?: RawCreateParams
) => ZodLazy<T>;
declare const literalType: <T extends Primitive>(
  value: T,
  params?: RawCreateParams
) => ZodLiteral<T>;
declare const enumType: typeof createZodEnum;
declare const nativeEnumType: <T extends EnumLike>(
  values: T,
  params?: RawCreateParams
) => ZodNativeEnum<T>;
declare const promiseType: <T extends ZodTypeAny>(
  schema: T,
  params?: RawCreateParams
) => ZodPromise<T>;
declare const effectsType: <I extends ZodTypeAny>(
  schema: I,
  effect: Effect<I["_output"]>,
  params?: RawCreateParams
) => ZodEffects<I, I["_output"], input<I>>;
declare const optionalType: <T extends ZodTypeAny>(
  type: T,
  params?: RawCreateParams
) => ZodOptional<T>;
declare const nullableType: <T extends ZodTypeAny>(
  type: T,
  params?: RawCreateParams
) => ZodNullable<T>;
declare const preprocessType: <I extends ZodTypeAny>(
  preprocess: (arg: unknown, ctx: RefinementCtx) => unknown,
  schema: I,
  params?: RawCreateParams
) => ZodEffects<I, I["_output"], unknown>;
declare const pipelineType: typeof ZodPipeline.create;
export declare const ostring: () => ZodOptional<ZodString>;
export declare const onumber: () => ZodOptional<ZodNumber>;
export declare const oboolean: () => ZodOptional<ZodBoolean>;
export declare const coerce: {
  string: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: true | undefined;
        })
      | undefined
  ) => ZodString;
  number: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodNumber;
  boolean: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodBoolean;
  bigint: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodBigInt;
  date: (
    params?:
      | ({
          errorMap?: ZodErrorMap | undefined;
          invalid_type_error?: string | undefined;
          required_error?: string | undefined;
          message?: string | undefined;
          description?: string | undefined;
        } & {
          coerce?: boolean | undefined;
        })
      | undefined
  ) => ZodDate;
};
export declare const NEVER: never;

declare namespace z {
  export {
    AnyZodObject,
    AnyZodTuple,
    ArrayCardinality,
    ArrayKeys,
    AssertArray,
    AsyncParseReturnType,
    BRAND,
    CatchallInput,
    CatchallOutput,
    CustomErrorParams,
    DIRTY,
    DenormalizedError,
    EMPTY_PATH,
    Effect,
    EnumLike,
    EnumValues,
    ErrorMapCtx,
    FilterEnum,
    INVALID,
    Indices,
    InnerTypeOfFunction,
    InputTypeOfTuple,
    InputTypeOfTupleWithRest,
    IpVersion,
    IssueData,
    KeySchema,
    NEVER,
    OK,
    ObjectPair,
    OuterTypeOfFunction,
    OutputTypeOfTuple,
    OutputTypeOfTupleWithRest,
    ParseContext,
    ParseInput,
    ParseParams,
    ParsePath,
    ParsePathComponent,
    ParseResult,
    ParseReturnType,
    ParseStatus,
    PassthroughType,
    PreprocessEffect,
    Primitive,
    ProcessedCreateParams,
    RawCreateParams,
    RecordType,
    Refinement,
    RefinementCtx,
    RefinementEffect,
    SafeParseError,
    SafeParseReturnType,
    SafeParseSuccess,
    Scalars,
    SomeZodObject,
    StringValidation,
    SuperRefinement,
    SyncParseReturnType,
    TransformEffect,
    TypeOf,
    TypeOf as infer,
    UnknownKeysParam,
    Values,
    Writeable,
    ZodAny,
    ZodAnyDef,
    ZodArray,
    ZodArrayDef,
    ZodBigInt,
    ZodBigIntCheck,
    ZodBigIntDef,
    ZodBoolean,
    ZodBooleanDef,
    ZodBranded,
    ZodBrandedDef,
    ZodCatch,
    ZodCatchDef,
    ZodCustomIssue,
    ZodDate,
    ZodDateCheck,
    ZodDateDef,
    ZodDefault,
    ZodDefaultDef,
    ZodDiscriminatedUnion,
    ZodDiscriminatedUnionDef,
    ZodDiscriminatedUnionOption,
    ZodEffects,
    ZodEffects as ZodTransformer,
    ZodEffectsDef,
    ZodEnum,
    ZodEnumDef,
    ZodError,
    ZodErrorMap,
    ZodFirstPartySchemaTypes,
    ZodFirstPartyTypeKind,
    ZodFormattedError,
    ZodFunction,
    ZodFunctionDef,
    ZodIntersection,
    ZodIntersectionDef,
    ZodInvalidArgumentsIssue,
    ZodInvalidDateIssue,
    ZodInvalidEnumValueIssue,
    ZodInvalidIntersectionTypesIssue,
    ZodInvalidLiteralIssue,
    ZodInvalidReturnTypeIssue,
    ZodInvalidStringIssue,
    ZodInvalidTypeIssue,
    ZodInvalidUnionDiscriminatorIssue,
    ZodInvalidUnionIssue,
    ZodIssue,
    ZodIssueBase,
    ZodIssueCode,
    ZodIssueOptionalMessage,
    ZodLazy,
    ZodLazyDef,
    ZodLiteral,
    ZodLiteralDef,
    ZodMap,
    ZodMapDef,
    ZodNaN,
    ZodNaNDef,
    ZodNativeEnum,
    ZodNativeEnumDef,
    ZodNever,
    ZodNeverDef,
    ZodNonEmptyArray,
    ZodNotFiniteIssue,
    ZodNotMultipleOfIssue,
    ZodNull,
    ZodNullDef,
    ZodNullable,
    ZodNullableDef,
    ZodNullableType,
    ZodNumber,
    ZodNumberCheck,
    ZodNumberDef,
    ZodObject,
    ZodObjectDef,
    ZodOptional,
    ZodOptionalDef,
    ZodOptionalType,
    ZodParsedType,
    ZodPipeline,
    ZodPipelineDef,
    ZodPromise,
    ZodPromiseDef,
    ZodRawShape,
    ZodReadonly,
    ZodReadonlyDef,
    ZodRecord,
    ZodRecordDef,
    ZodSet,
    ZodSetDef,
    ZodString,
    ZodStringCheck,
    ZodStringDef,
    ZodSymbol,
    ZodSymbolDef,
    ZodTooBigIssue,
    ZodTooSmallIssue,
    ZodTuple,
    ZodTupleDef,
    ZodTupleItems,
    ZodType,
    ZodType as Schema,
    ZodType as ZodSchema,
    ZodTypeAny,
    ZodTypeDef,
    ZodUndefined,
    ZodUndefinedDef,
    ZodUnion,
    ZodUnionDef,
    ZodUnionOptions,
    ZodUnknown,
    ZodUnknownDef,
    ZodUnrecognizedKeysIssue,
    ZodVoid,
    ZodVoidDef,
    addIssueToContext,
    anyType as any,
    arrayOutputType,
    arrayType as array,
    baseObjectInputType,
    baseObjectOutputType,
    bigIntType as bigint,
    booleanType as boolean,
    coerce,
    custom,
    dateType as date,
    datetimeRegex,
    deoptional,
    discriminatedUnionType as discriminatedUnion,
    effectsType as effect,
    effectsType as transformer,
    enumType as enum,
    errorMap as defaultErrorMap,
    functionType as function,
    getErrorMap,
    getParsedType,
    inferFlattenedErrors,
    inferFormattedError,
    input,
    instanceOfType as instanceof,
    intersectionType as intersection,
    isAborted,
    isAsync,
    isDirty,
    isValid,
    late,
    lazyType as lazy,
    literalType as literal,
    makeIssue,
    mapType as map,
    mergeTypes,
    nanType as nan,
    nativeEnumType as nativeEnum,
    neverType as never,
    noUnrecognized,
    nullType as null,
    nullableType as nullable,
    numberType as number,
    objectInputType,
    objectOutputType,
    objectType as object,
    objectUtil,
    oboolean,
    onumber,
    optionalType as optional,
    ostring,
    output,
    pipelineType as pipeline,
    preprocessType as preprocess,
    promiseType as promise,
    quotelessJson,
    recordType as record,
    setErrorMap,
    setType as set,
    strictObjectType as strictObject,
    stringType as string,
    symbolType as symbol,
    tupleType as tuple,
    typeToFlattenedError,
    typecast,
    undefinedType as undefined,
    unionType as union,
    unknownType as unknown,
    util,
    voidType as void,
  };
}

export {
  TypeOf as infer,
  ZodEffects as ZodTransformer,
  ZodType as Schema,
  ZodType as ZodSchema,
  anyType as any,
  arrayType as array,
  bigIntType as bigint,
  booleanType as boolean,
  dateType as date,
  discriminatedUnionType as discriminatedUnion,
  effectsType as effect,
  effectsType as transformer,
  enumType as enum,
  errorMap as defaultErrorMap,
  functionType as function,
  instanceOfType as instanceof,
  intersectionType as intersection,
  lazyType as lazy,
  literalType as literal,
  mapType as map,
  nanType as nan,
  nativeEnumType as nativeEnum,
  neverType as never,
  nullType as null,
  nullableType as nullable,
  numberType as number,
  objectType as object,
  optionalType as optional,
  pipelineType as pipeline,
  preprocessType as preprocess,
  promiseType as promise,
  recordType as record,
  setType as set,
  strictObjectType as strictObject,
  stringType as string,
  symbolType as symbol,
  tupleType as tuple,
  undefinedType as undefined,
  unionType as union,
  unknownType as unknown,
  voidType as void,
  z,
};

export {};
