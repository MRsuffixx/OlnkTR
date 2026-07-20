
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Theme
 * 
 */
export type Theme = $Result.DefaultSelection<Prisma.$ThemePayload>
/**
 * Model ProfileLink
 * 
 */
export type ProfileLink = $Result.DefaultSelection<Prisma.$ProfileLinkPayload>
/**
 * Model ClickEvent
 * 
 */
export type ClickEvent = $Result.DefaultSelection<Prisma.$ClickEventPayload>
/**
 * Model AuthIntent
 * 
 */
export type AuthIntent = $Result.DefaultSelection<Prisma.$AuthIntentPayload>
/**
 * Model UsernameBlocklist
 * 
 */
export type UsernameBlocklist = $Result.DefaultSelection<Prisma.$UsernameBlocklistPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model VerificationToken
 * 
 */
export type VerificationToken = $Result.DefaultSelection<Prisma.$VerificationTokenPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const BackgroundType: {
  SOLID: 'SOLID',
  GRADIENT: 'GRADIENT',
  IMAGE: 'IMAGE'
};

export type BackgroundType = (typeof BackgroundType)[keyof typeof BackgroundType]


export const ButtonStyle: {
  SOLID: 'SOLID',
  OUTLINE: 'OUTLINE',
  GLASS: 'GLASS',
  SHADOW: 'SHADOW'
};

export type ButtonStyle = (typeof ButtonStyle)[keyof typeof ButtonStyle]


export const ButtonShape: {
  ROUNDED: 'ROUNDED',
  PILL: 'PILL',
  SQUARE: 'SQUARE'
};

export type ButtonShape = (typeof ButtonShape)[keyof typeof ButtonShape]


export const FontFamily: {
  MODERN: 'MODERN',
  FRIENDLY: 'FRIENDLY',
  EDITORIAL: 'EDITORIAL',
  MONO: 'MONO'
};

export type FontFamily = (typeof FontFamily)[keyof typeof FontFamily]

}

export type BackgroundType = $Enums.BackgroundType

export const BackgroundType: typeof $Enums.BackgroundType

export type ButtonStyle = $Enums.ButtonStyle

export const ButtonStyle: typeof $Enums.ButtonStyle

export type ButtonShape = $Enums.ButtonShape

export const ButtonShape: typeof $Enums.ButtonShape

export type FontFamily = $Enums.FontFamily

export const FontFamily: typeof $Enums.FontFamily

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.theme`: Exposes CRUD operations for the **Theme** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Themes
    * const themes = await prisma.theme.findMany()
    * ```
    */
  get theme(): Prisma.ThemeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.profileLink`: Exposes CRUD operations for the **ProfileLink** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProfileLinks
    * const profileLinks = await prisma.profileLink.findMany()
    * ```
    */
  get profileLink(): Prisma.ProfileLinkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.clickEvent`: Exposes CRUD operations for the **ClickEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClickEvents
    * const clickEvents = await prisma.clickEvent.findMany()
    * ```
    */
  get clickEvent(): Prisma.ClickEventDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.authIntent`: Exposes CRUD operations for the **AuthIntent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthIntents
    * const authIntents = await prisma.authIntent.findMany()
    * ```
    */
  get authIntent(): Prisma.AuthIntentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.usernameBlocklist`: Exposes CRUD operations for the **UsernameBlocklist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UsernameBlocklists
    * const usernameBlocklists = await prisma.usernameBlocklist.findMany()
    * ```
    */
  get usernameBlocklist(): Prisma.UsernameBlocklistDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verificationToken`: Exposes CRUD operations for the **VerificationToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VerificationTokens
    * const verificationTokens = await prisma.verificationToken.findMany()
    * ```
    */
  get verificationToken(): Prisma.VerificationTokenDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Theme: 'Theme',
    ProfileLink: 'ProfileLink',
    ClickEvent: 'ClickEvent',
    AuthIntent: 'AuthIntent',
    UsernameBlocklist: 'UsernameBlocklist',
    Account: 'Account',
    Session: 'Session',
    VerificationToken: 'VerificationToken'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "theme" | "profileLink" | "clickEvent" | "authIntent" | "usernameBlocklist" | "account" | "session" | "verificationToken"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Theme: {
        payload: Prisma.$ThemePayload<ExtArgs>
        fields: Prisma.ThemeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ThemeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ThemeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>
          }
          findFirst: {
            args: Prisma.ThemeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ThemeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>
          }
          findMany: {
            args: Prisma.ThemeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>[]
          }
          create: {
            args: Prisma.ThemeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>
          }
          createMany: {
            args: Prisma.ThemeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ThemeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>[]
          }
          delete: {
            args: Prisma.ThemeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>
          }
          update: {
            args: Prisma.ThemeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>
          }
          deleteMany: {
            args: Prisma.ThemeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ThemeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ThemeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>[]
          }
          upsert: {
            args: Prisma.ThemeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ThemePayload>
          }
          aggregate: {
            args: Prisma.ThemeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTheme>
          }
          groupBy: {
            args: Prisma.ThemeGroupByArgs<ExtArgs>
            result: $Utils.Optional<ThemeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ThemeCountArgs<ExtArgs>
            result: $Utils.Optional<ThemeCountAggregateOutputType> | number
          }
        }
      }
      ProfileLink: {
        payload: Prisma.$ProfileLinkPayload<ExtArgs>
        fields: Prisma.ProfileLinkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProfileLinkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProfileLinkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>
          }
          findFirst: {
            args: Prisma.ProfileLinkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProfileLinkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>
          }
          findMany: {
            args: Prisma.ProfileLinkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>[]
          }
          create: {
            args: Prisma.ProfileLinkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>
          }
          createMany: {
            args: Prisma.ProfileLinkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProfileLinkCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>[]
          }
          delete: {
            args: Prisma.ProfileLinkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>
          }
          update: {
            args: Prisma.ProfileLinkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>
          }
          deleteMany: {
            args: Prisma.ProfileLinkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProfileLinkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProfileLinkUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>[]
          }
          upsert: {
            args: Prisma.ProfileLinkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileLinkPayload>
          }
          aggregate: {
            args: Prisma.ProfileLinkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProfileLink>
          }
          groupBy: {
            args: Prisma.ProfileLinkGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProfileLinkGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProfileLinkCountArgs<ExtArgs>
            result: $Utils.Optional<ProfileLinkCountAggregateOutputType> | number
          }
        }
      }
      ClickEvent: {
        payload: Prisma.$ClickEventPayload<ExtArgs>
        fields: Prisma.ClickEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClickEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClickEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>
          }
          findFirst: {
            args: Prisma.ClickEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClickEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>
          }
          findMany: {
            args: Prisma.ClickEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>[]
          }
          create: {
            args: Prisma.ClickEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>
          }
          createMany: {
            args: Prisma.ClickEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClickEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>[]
          }
          delete: {
            args: Prisma.ClickEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>
          }
          update: {
            args: Prisma.ClickEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>
          }
          deleteMany: {
            args: Prisma.ClickEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClickEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClickEventUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>[]
          }
          upsert: {
            args: Prisma.ClickEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClickEventPayload>
          }
          aggregate: {
            args: Prisma.ClickEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClickEvent>
          }
          groupBy: {
            args: Prisma.ClickEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClickEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClickEventCountArgs<ExtArgs>
            result: $Utils.Optional<ClickEventCountAggregateOutputType> | number
          }
        }
      }
      AuthIntent: {
        payload: Prisma.$AuthIntentPayload<ExtArgs>
        fields: Prisma.AuthIntentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthIntentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthIntentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>
          }
          findFirst: {
            args: Prisma.AuthIntentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthIntentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>
          }
          findMany: {
            args: Prisma.AuthIntentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>[]
          }
          create: {
            args: Prisma.AuthIntentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>
          }
          createMany: {
            args: Prisma.AuthIntentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthIntentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>[]
          }
          delete: {
            args: Prisma.AuthIntentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>
          }
          update: {
            args: Prisma.AuthIntentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>
          }
          deleteMany: {
            args: Prisma.AuthIntentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthIntentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuthIntentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>[]
          }
          upsert: {
            args: Prisma.AuthIntentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthIntentPayload>
          }
          aggregate: {
            args: Prisma.AuthIntentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthIntent>
          }
          groupBy: {
            args: Prisma.AuthIntentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthIntentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthIntentCountArgs<ExtArgs>
            result: $Utils.Optional<AuthIntentCountAggregateOutputType> | number
          }
        }
      }
      UsernameBlocklist: {
        payload: Prisma.$UsernameBlocklistPayload<ExtArgs>
        fields: Prisma.UsernameBlocklistFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsernameBlocklistFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsernameBlocklistFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>
          }
          findFirst: {
            args: Prisma.UsernameBlocklistFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsernameBlocklistFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>
          }
          findMany: {
            args: Prisma.UsernameBlocklistFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>[]
          }
          create: {
            args: Prisma.UsernameBlocklistCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>
          }
          createMany: {
            args: Prisma.UsernameBlocklistCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsernameBlocklistCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>[]
          }
          delete: {
            args: Prisma.UsernameBlocklistDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>
          }
          update: {
            args: Prisma.UsernameBlocklistUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>
          }
          deleteMany: {
            args: Prisma.UsernameBlocklistDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsernameBlocklistUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsernameBlocklistUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>[]
          }
          upsert: {
            args: Prisma.UsernameBlocklistUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsernameBlocklistPayload>
          }
          aggregate: {
            args: Prisma.UsernameBlocklistAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsernameBlocklist>
          }
          groupBy: {
            args: Prisma.UsernameBlocklistGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsernameBlocklistGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsernameBlocklistCountArgs<ExtArgs>
            result: $Utils.Optional<UsernameBlocklistCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      VerificationToken: {
        payload: Prisma.$VerificationTokenPayload<ExtArgs>
        fields: Prisma.VerificationTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findFirst: {
            args: Prisma.VerificationTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findMany: {
            args: Prisma.VerificationTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          create: {
            args: Prisma.VerificationTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          createMany: {
            args: Prisma.VerificationTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          delete: {
            args: Prisma.VerificationTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          update: {
            args: Prisma.VerificationTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          deleteMany: {
            args: Prisma.VerificationTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          upsert: {
            args: Prisma.VerificationTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          aggregate: {
            args: Prisma.VerificationTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerificationToken>
          }
          groupBy: {
            args: Prisma.VerificationTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationTokenCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    theme?: ThemeOmit
    profileLink?: ProfileLinkOmit
    clickEvent?: ClickEventOmit
    authIntent?: AuthIntentOmit
    usernameBlocklist?: UsernameBlocklistOmit
    account?: AccountOmit
    session?: SessionOmit
    verificationToken?: VerificationTokenOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    accounts: number
    sessions: number
    links: number
    clicks: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | UserCountOutputTypeCountAccountsArgs
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    links?: boolean | UserCountOutputTypeCountLinksArgs
    clicks?: boolean | UserCountOutputTypeCountClicksArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileLinkWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClickEventWhereInput
  }


  /**
   * Count Type ProfileLinkCountOutputType
   */

  export type ProfileLinkCountOutputType = {
    clicks: number
  }

  export type ProfileLinkCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clicks?: boolean | ProfileLinkCountOutputTypeCountClicksArgs
  }

  // Custom InputTypes
  /**
   * ProfileLinkCountOutputType without action
   */
  export type ProfileLinkCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLinkCountOutputType
     */
    select?: ProfileLinkCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProfileLinkCountOutputType without action
   */
  export type ProfileLinkCountOutputTypeCountClicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClickEventWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    editorRevision: number | null
  }

  export type UserSumAggregateOutputType = {
    editorRevision: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    username: string | null
    usernameNormalized: string | null
    bio: string | null
    onboardedAt: Date | null
    editorRevision: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    username: string | null
    usernameNormalized: string | null
    bio: string | null
    onboardedAt: Date | null
    editorRevision: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    emailVerified: number
    image: number
    username: number
    usernameNormalized: number
    bio: number
    onboardedAt: number
    editorRevision: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    editorRevision?: true
  }

  export type UserSumAggregateInputType = {
    editorRevision?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    username?: true
    usernameNormalized?: true
    bio?: true
    onboardedAt?: true
    editorRevision?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    username?: true
    usernameNormalized?: true
    bio?: true
    onboardedAt?: true
    editorRevision?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    username?: true
    usernameNormalized?: true
    bio?: true
    onboardedAt?: true
    editorRevision?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    username: string | null
    usernameNormalized: string | null
    bio: string
    onboardedAt: Date | null
    editorRevision: number
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    username?: boolean
    usernameNormalized?: boolean
    bio?: boolean
    onboardedAt?: boolean
    editorRevision?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    accounts?: boolean | User$accountsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    theme?: boolean | User$themeArgs<ExtArgs>
    links?: boolean | User$linksArgs<ExtArgs>
    clicks?: boolean | User$clicksArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    username?: boolean
    usernameNormalized?: boolean
    bio?: boolean
    onboardedAt?: boolean
    editorRevision?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    username?: boolean
    usernameNormalized?: boolean
    bio?: boolean
    onboardedAt?: boolean
    editorRevision?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    username?: boolean
    usernameNormalized?: boolean
    bio?: boolean
    onboardedAt?: boolean
    editorRevision?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "username" | "usernameNormalized" | "bio" | "onboardedAt" | "editorRevision" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | User$accountsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    theme?: boolean | User$themeArgs<ExtArgs>
    links?: boolean | User$linksArgs<ExtArgs>
    clicks?: boolean | User$clicksArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      accounts: Prisma.$AccountPayload<ExtArgs>[]
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      theme: Prisma.$ThemePayload<ExtArgs> | null
      links: Prisma.$ProfileLinkPayload<ExtArgs>[]
      clicks: Prisma.$ClickEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      email: string | null
      emailVerified: Date | null
      image: string | null
      username: string | null
      usernameNormalized: string | null
      bio: string
      onboardedAt: Date | null
      editorRevision: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    accounts<T extends User$accountsArgs<ExtArgs> = {}>(args?: Subset<T, User$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    theme<T extends User$themeArgs<ExtArgs> = {}>(args?: Subset<T, User$themeArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    links<T extends User$linksArgs<ExtArgs> = {}>(args?: Subset<T, User$linksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    clicks<T extends User$clicksArgs<ExtArgs> = {}>(args?: Subset<T, User$clicksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly emailVerified: FieldRef<"User", 'DateTime'>
    readonly image: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly usernameNormalized: FieldRef<"User", 'String'>
    readonly bio: FieldRef<"User", 'String'>
    readonly onboardedAt: FieldRef<"User", 'DateTime'>
    readonly editorRevision: FieldRef<"User", 'Int'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.accounts
   */
  export type User$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    cursor?: AccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User.theme
   */
  export type User$themeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    where?: ThemeWhereInput
  }

  /**
   * User.links
   */
  export type User$linksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    where?: ProfileLinkWhereInput
    orderBy?: ProfileLinkOrderByWithRelationInput | ProfileLinkOrderByWithRelationInput[]
    cursor?: ProfileLinkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProfileLinkScalarFieldEnum | ProfileLinkScalarFieldEnum[]
  }

  /**
   * User.clicks
   */
  export type User$clicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    where?: ClickEventWhereInput
    orderBy?: ClickEventOrderByWithRelationInput | ClickEventOrderByWithRelationInput[]
    cursor?: ClickEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClickEventScalarFieldEnum | ClickEventScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Theme
   */

  export type AggregateTheme = {
    _count: ThemeCountAggregateOutputType | null
    _min: ThemeMinAggregateOutputType | null
    _max: ThemeMaxAggregateOutputType | null
  }

  export type ThemeMinAggregateOutputType = {
    id: string | null
    userId: string | null
    backgroundType: $Enums.BackgroundType | null
    backgroundValue: string | null
    buttonStyle: $Enums.ButtonStyle | null
    buttonShape: $Enums.ButtonShape | null
    buttonColor: string | null
    textColor: string | null
    accentColor: string | null
    fontFamily: $Enums.FontFamily | null
    showBranding: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ThemeMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    backgroundType: $Enums.BackgroundType | null
    backgroundValue: string | null
    buttonStyle: $Enums.ButtonStyle | null
    buttonShape: $Enums.ButtonShape | null
    buttonColor: string | null
    textColor: string | null
    accentColor: string | null
    fontFamily: $Enums.FontFamily | null
    showBranding: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ThemeCountAggregateOutputType = {
    id: number
    userId: number
    backgroundType: number
    backgroundValue: number
    buttonStyle: number
    buttonShape: number
    buttonColor: number
    textColor: number
    accentColor: number
    fontFamily: number
    showBranding: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ThemeMinAggregateInputType = {
    id?: true
    userId?: true
    backgroundType?: true
    backgroundValue?: true
    buttonStyle?: true
    buttonShape?: true
    buttonColor?: true
    textColor?: true
    accentColor?: true
    fontFamily?: true
    showBranding?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ThemeMaxAggregateInputType = {
    id?: true
    userId?: true
    backgroundType?: true
    backgroundValue?: true
    buttonStyle?: true
    buttonShape?: true
    buttonColor?: true
    textColor?: true
    accentColor?: true
    fontFamily?: true
    showBranding?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ThemeCountAggregateInputType = {
    id?: true
    userId?: true
    backgroundType?: true
    backgroundValue?: true
    buttonStyle?: true
    buttonShape?: true
    buttonColor?: true
    textColor?: true
    accentColor?: true
    fontFamily?: true
    showBranding?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ThemeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Theme to aggregate.
     */
    where?: ThemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Themes to fetch.
     */
    orderBy?: ThemeOrderByWithRelationInput | ThemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ThemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Themes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Themes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Themes
    **/
    _count?: true | ThemeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ThemeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ThemeMaxAggregateInputType
  }

  export type GetThemeAggregateType<T extends ThemeAggregateArgs> = {
        [P in keyof T & keyof AggregateTheme]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTheme[P]>
      : GetScalarType<T[P], AggregateTheme[P]>
  }




  export type ThemeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ThemeWhereInput
    orderBy?: ThemeOrderByWithAggregationInput | ThemeOrderByWithAggregationInput[]
    by: ThemeScalarFieldEnum[] | ThemeScalarFieldEnum
    having?: ThemeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ThemeCountAggregateInputType | true
    _min?: ThemeMinAggregateInputType
    _max?: ThemeMaxAggregateInputType
  }

  export type ThemeGroupByOutputType = {
    id: string
    userId: string
    backgroundType: $Enums.BackgroundType
    backgroundValue: string
    buttonStyle: $Enums.ButtonStyle
    buttonShape: $Enums.ButtonShape
    buttonColor: string
    textColor: string
    accentColor: string
    fontFamily: $Enums.FontFamily
    showBranding: boolean
    createdAt: Date
    updatedAt: Date
    _count: ThemeCountAggregateOutputType | null
    _min: ThemeMinAggregateOutputType | null
    _max: ThemeMaxAggregateOutputType | null
  }

  type GetThemeGroupByPayload<T extends ThemeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ThemeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ThemeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ThemeGroupByOutputType[P]>
            : GetScalarType<T[P], ThemeGroupByOutputType[P]>
        }
      >
    >


  export type ThemeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    backgroundType?: boolean
    backgroundValue?: boolean
    buttonStyle?: boolean
    buttonShape?: boolean
    buttonColor?: boolean
    textColor?: boolean
    accentColor?: boolean
    fontFamily?: boolean
    showBranding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["theme"]>

  export type ThemeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    backgroundType?: boolean
    backgroundValue?: boolean
    buttonStyle?: boolean
    buttonShape?: boolean
    buttonColor?: boolean
    textColor?: boolean
    accentColor?: boolean
    fontFamily?: boolean
    showBranding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["theme"]>

  export type ThemeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    backgroundType?: boolean
    backgroundValue?: boolean
    buttonStyle?: boolean
    buttonShape?: boolean
    buttonColor?: boolean
    textColor?: boolean
    accentColor?: boolean
    fontFamily?: boolean
    showBranding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["theme"]>

  export type ThemeSelectScalar = {
    id?: boolean
    userId?: boolean
    backgroundType?: boolean
    backgroundValue?: boolean
    buttonStyle?: boolean
    buttonShape?: boolean
    buttonColor?: boolean
    textColor?: boolean
    accentColor?: boolean
    fontFamily?: boolean
    showBranding?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ThemeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "backgroundType" | "backgroundValue" | "buttonStyle" | "buttonShape" | "buttonColor" | "textColor" | "accentColor" | "fontFamily" | "showBranding" | "createdAt" | "updatedAt", ExtArgs["result"]["theme"]>
  export type ThemeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ThemeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ThemeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ThemePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Theme"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      backgroundType: $Enums.BackgroundType
      backgroundValue: string
      buttonStyle: $Enums.ButtonStyle
      buttonShape: $Enums.ButtonShape
      buttonColor: string
      textColor: string
      accentColor: string
      fontFamily: $Enums.FontFamily
      showBranding: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["theme"]>
    composites: {}
  }

  type ThemeGetPayload<S extends boolean | null | undefined | ThemeDefaultArgs> = $Result.GetResult<Prisma.$ThemePayload, S>

  type ThemeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ThemeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ThemeCountAggregateInputType | true
    }

  export interface ThemeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Theme'], meta: { name: 'Theme' } }
    /**
     * Find zero or one Theme that matches the filter.
     * @param {ThemeFindUniqueArgs} args - Arguments to find a Theme
     * @example
     * // Get one Theme
     * const theme = await prisma.theme.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ThemeFindUniqueArgs>(args: SelectSubset<T, ThemeFindUniqueArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Theme that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ThemeFindUniqueOrThrowArgs} args - Arguments to find a Theme
     * @example
     * // Get one Theme
     * const theme = await prisma.theme.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ThemeFindUniqueOrThrowArgs>(args: SelectSubset<T, ThemeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Theme that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeFindFirstArgs} args - Arguments to find a Theme
     * @example
     * // Get one Theme
     * const theme = await prisma.theme.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ThemeFindFirstArgs>(args?: SelectSubset<T, ThemeFindFirstArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Theme that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeFindFirstOrThrowArgs} args - Arguments to find a Theme
     * @example
     * // Get one Theme
     * const theme = await prisma.theme.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ThemeFindFirstOrThrowArgs>(args?: SelectSubset<T, ThemeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Themes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Themes
     * const themes = await prisma.theme.findMany()
     * 
     * // Get first 10 Themes
     * const themes = await prisma.theme.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const themeWithIdOnly = await prisma.theme.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ThemeFindManyArgs>(args?: SelectSubset<T, ThemeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Theme.
     * @param {ThemeCreateArgs} args - Arguments to create a Theme.
     * @example
     * // Create one Theme
     * const Theme = await prisma.theme.create({
     *   data: {
     *     // ... data to create a Theme
     *   }
     * })
     * 
     */
    create<T extends ThemeCreateArgs>(args: SelectSubset<T, ThemeCreateArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Themes.
     * @param {ThemeCreateManyArgs} args - Arguments to create many Themes.
     * @example
     * // Create many Themes
     * const theme = await prisma.theme.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ThemeCreateManyArgs>(args?: SelectSubset<T, ThemeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Themes and returns the data saved in the database.
     * @param {ThemeCreateManyAndReturnArgs} args - Arguments to create many Themes.
     * @example
     * // Create many Themes
     * const theme = await prisma.theme.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Themes and only return the `id`
     * const themeWithIdOnly = await prisma.theme.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ThemeCreateManyAndReturnArgs>(args?: SelectSubset<T, ThemeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Theme.
     * @param {ThemeDeleteArgs} args - Arguments to delete one Theme.
     * @example
     * // Delete one Theme
     * const Theme = await prisma.theme.delete({
     *   where: {
     *     // ... filter to delete one Theme
     *   }
     * })
     * 
     */
    delete<T extends ThemeDeleteArgs>(args: SelectSubset<T, ThemeDeleteArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Theme.
     * @param {ThemeUpdateArgs} args - Arguments to update one Theme.
     * @example
     * // Update one Theme
     * const theme = await prisma.theme.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ThemeUpdateArgs>(args: SelectSubset<T, ThemeUpdateArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Themes.
     * @param {ThemeDeleteManyArgs} args - Arguments to filter Themes to delete.
     * @example
     * // Delete a few Themes
     * const { count } = await prisma.theme.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ThemeDeleteManyArgs>(args?: SelectSubset<T, ThemeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Themes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Themes
     * const theme = await prisma.theme.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ThemeUpdateManyArgs>(args: SelectSubset<T, ThemeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Themes and returns the data updated in the database.
     * @param {ThemeUpdateManyAndReturnArgs} args - Arguments to update many Themes.
     * @example
     * // Update many Themes
     * const theme = await prisma.theme.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Themes and only return the `id`
     * const themeWithIdOnly = await prisma.theme.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ThemeUpdateManyAndReturnArgs>(args: SelectSubset<T, ThemeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Theme.
     * @param {ThemeUpsertArgs} args - Arguments to update or create a Theme.
     * @example
     * // Update or create a Theme
     * const theme = await prisma.theme.upsert({
     *   create: {
     *     // ... data to create a Theme
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Theme we want to update
     *   }
     * })
     */
    upsert<T extends ThemeUpsertArgs>(args: SelectSubset<T, ThemeUpsertArgs<ExtArgs>>): Prisma__ThemeClient<$Result.GetResult<Prisma.$ThemePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Themes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeCountArgs} args - Arguments to filter Themes to count.
     * @example
     * // Count the number of Themes
     * const count = await prisma.theme.count({
     *   where: {
     *     // ... the filter for the Themes we want to count
     *   }
     * })
    **/
    count<T extends ThemeCountArgs>(
      args?: Subset<T, ThemeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ThemeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Theme.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ThemeAggregateArgs>(args: Subset<T, ThemeAggregateArgs>): Prisma.PrismaPromise<GetThemeAggregateType<T>>

    /**
     * Group by Theme.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ThemeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ThemeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ThemeGroupByArgs['orderBy'] }
        : { orderBy?: ThemeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ThemeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetThemeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Theme model
   */
  readonly fields: ThemeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Theme.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ThemeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Theme model
   */
  interface ThemeFieldRefs {
    readonly id: FieldRef<"Theme", 'String'>
    readonly userId: FieldRef<"Theme", 'String'>
    readonly backgroundType: FieldRef<"Theme", 'BackgroundType'>
    readonly backgroundValue: FieldRef<"Theme", 'String'>
    readonly buttonStyle: FieldRef<"Theme", 'ButtonStyle'>
    readonly buttonShape: FieldRef<"Theme", 'ButtonShape'>
    readonly buttonColor: FieldRef<"Theme", 'String'>
    readonly textColor: FieldRef<"Theme", 'String'>
    readonly accentColor: FieldRef<"Theme", 'String'>
    readonly fontFamily: FieldRef<"Theme", 'FontFamily'>
    readonly showBranding: FieldRef<"Theme", 'Boolean'>
    readonly createdAt: FieldRef<"Theme", 'DateTime'>
    readonly updatedAt: FieldRef<"Theme", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Theme findUnique
   */
  export type ThemeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * Filter, which Theme to fetch.
     */
    where: ThemeWhereUniqueInput
  }

  /**
   * Theme findUniqueOrThrow
   */
  export type ThemeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * Filter, which Theme to fetch.
     */
    where: ThemeWhereUniqueInput
  }

  /**
   * Theme findFirst
   */
  export type ThemeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * Filter, which Theme to fetch.
     */
    where?: ThemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Themes to fetch.
     */
    orderBy?: ThemeOrderByWithRelationInput | ThemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Themes.
     */
    cursor?: ThemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Themes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Themes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Themes.
     */
    distinct?: ThemeScalarFieldEnum | ThemeScalarFieldEnum[]
  }

  /**
   * Theme findFirstOrThrow
   */
  export type ThemeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * Filter, which Theme to fetch.
     */
    where?: ThemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Themes to fetch.
     */
    orderBy?: ThemeOrderByWithRelationInput | ThemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Themes.
     */
    cursor?: ThemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Themes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Themes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Themes.
     */
    distinct?: ThemeScalarFieldEnum | ThemeScalarFieldEnum[]
  }

  /**
   * Theme findMany
   */
  export type ThemeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * Filter, which Themes to fetch.
     */
    where?: ThemeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Themes to fetch.
     */
    orderBy?: ThemeOrderByWithRelationInput | ThemeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Themes.
     */
    cursor?: ThemeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Themes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Themes.
     */
    skip?: number
    distinct?: ThemeScalarFieldEnum | ThemeScalarFieldEnum[]
  }

  /**
   * Theme create
   */
  export type ThemeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * The data needed to create a Theme.
     */
    data: XOR<ThemeCreateInput, ThemeUncheckedCreateInput>
  }

  /**
   * Theme createMany
   */
  export type ThemeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Themes.
     */
    data: ThemeCreateManyInput | ThemeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Theme createManyAndReturn
   */
  export type ThemeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * The data used to create many Themes.
     */
    data: ThemeCreateManyInput | ThemeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Theme update
   */
  export type ThemeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * The data needed to update a Theme.
     */
    data: XOR<ThemeUpdateInput, ThemeUncheckedUpdateInput>
    /**
     * Choose, which Theme to update.
     */
    where: ThemeWhereUniqueInput
  }

  /**
   * Theme updateMany
   */
  export type ThemeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Themes.
     */
    data: XOR<ThemeUpdateManyMutationInput, ThemeUncheckedUpdateManyInput>
    /**
     * Filter which Themes to update
     */
    where?: ThemeWhereInput
    /**
     * Limit how many Themes to update.
     */
    limit?: number
  }

  /**
   * Theme updateManyAndReturn
   */
  export type ThemeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * The data used to update Themes.
     */
    data: XOR<ThemeUpdateManyMutationInput, ThemeUncheckedUpdateManyInput>
    /**
     * Filter which Themes to update
     */
    where?: ThemeWhereInput
    /**
     * Limit how many Themes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Theme upsert
   */
  export type ThemeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * The filter to search for the Theme to update in case it exists.
     */
    where: ThemeWhereUniqueInput
    /**
     * In case the Theme found by the `where` argument doesn't exist, create a new Theme with this data.
     */
    create: XOR<ThemeCreateInput, ThemeUncheckedCreateInput>
    /**
     * In case the Theme was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ThemeUpdateInput, ThemeUncheckedUpdateInput>
  }

  /**
   * Theme delete
   */
  export type ThemeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
    /**
     * Filter which Theme to delete.
     */
    where: ThemeWhereUniqueInput
  }

  /**
   * Theme deleteMany
   */
  export type ThemeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Themes to delete
     */
    where?: ThemeWhereInput
    /**
     * Limit how many Themes to delete.
     */
    limit?: number
  }

  /**
   * Theme without action
   */
  export type ThemeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Theme
     */
    select?: ThemeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Theme
     */
    omit?: ThemeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ThemeInclude<ExtArgs> | null
  }


  /**
   * Model ProfileLink
   */

  export type AggregateProfileLink = {
    _count: ProfileLinkCountAggregateOutputType | null
    _avg: ProfileLinkAvgAggregateOutputType | null
    _sum: ProfileLinkSumAggregateOutputType | null
    _min: ProfileLinkMinAggregateOutputType | null
    _max: ProfileLinkMaxAggregateOutputType | null
  }

  export type ProfileLinkAvgAggregateOutputType = {
    position: number | null
  }

  export type ProfileLinkSumAggregateOutputType = {
    position: number | null
  }

  export type ProfileLinkMinAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    url: string | null
    iconUrl: string | null
    position: number | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProfileLinkMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    title: string | null
    url: string | null
    iconUrl: string | null
    position: number | null
    enabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProfileLinkCountAggregateOutputType = {
    id: number
    userId: number
    title: number
    url: number
    iconUrl: number
    position: number
    enabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProfileLinkAvgAggregateInputType = {
    position?: true
  }

  export type ProfileLinkSumAggregateInputType = {
    position?: true
  }

  export type ProfileLinkMinAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    url?: true
    iconUrl?: true
    position?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProfileLinkMaxAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    url?: true
    iconUrl?: true
    position?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProfileLinkCountAggregateInputType = {
    id?: true
    userId?: true
    title?: true
    url?: true
    iconUrl?: true
    position?: true
    enabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProfileLinkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProfileLink to aggregate.
     */
    where?: ProfileLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileLinks to fetch.
     */
    orderBy?: ProfileLinkOrderByWithRelationInput | ProfileLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProfileLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProfileLinks
    **/
    _count?: true | ProfileLinkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProfileLinkAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProfileLinkSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProfileLinkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProfileLinkMaxAggregateInputType
  }

  export type GetProfileLinkAggregateType<T extends ProfileLinkAggregateArgs> = {
        [P in keyof T & keyof AggregateProfileLink]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProfileLink[P]>
      : GetScalarType<T[P], AggregateProfileLink[P]>
  }




  export type ProfileLinkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileLinkWhereInput
    orderBy?: ProfileLinkOrderByWithAggregationInput | ProfileLinkOrderByWithAggregationInput[]
    by: ProfileLinkScalarFieldEnum[] | ProfileLinkScalarFieldEnum
    having?: ProfileLinkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProfileLinkCountAggregateInputType | true
    _avg?: ProfileLinkAvgAggregateInputType
    _sum?: ProfileLinkSumAggregateInputType
    _min?: ProfileLinkMinAggregateInputType
    _max?: ProfileLinkMaxAggregateInputType
  }

  export type ProfileLinkGroupByOutputType = {
    id: string
    userId: string
    title: string
    url: string
    iconUrl: string | null
    position: number
    enabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: ProfileLinkCountAggregateOutputType | null
    _avg: ProfileLinkAvgAggregateOutputType | null
    _sum: ProfileLinkSumAggregateOutputType | null
    _min: ProfileLinkMinAggregateOutputType | null
    _max: ProfileLinkMaxAggregateOutputType | null
  }

  type GetProfileLinkGroupByPayload<T extends ProfileLinkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProfileLinkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProfileLinkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProfileLinkGroupByOutputType[P]>
            : GetScalarType<T[P], ProfileLinkGroupByOutputType[P]>
        }
      >
    >


  export type ProfileLinkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    url?: boolean
    iconUrl?: boolean
    position?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    clicks?: boolean | ProfileLink$clicksArgs<ExtArgs>
    _count?: boolean | ProfileLinkCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profileLink"]>

  export type ProfileLinkSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    url?: boolean
    iconUrl?: boolean
    position?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profileLink"]>

  export type ProfileLinkSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    title?: boolean
    url?: boolean
    iconUrl?: boolean
    position?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["profileLink"]>

  export type ProfileLinkSelectScalar = {
    id?: boolean
    userId?: boolean
    title?: boolean
    url?: boolean
    iconUrl?: boolean
    position?: boolean
    enabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProfileLinkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "title" | "url" | "iconUrl" | "position" | "enabled" | "createdAt" | "updatedAt", ExtArgs["result"]["profileLink"]>
  export type ProfileLinkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    clicks?: boolean | ProfileLink$clicksArgs<ExtArgs>
    _count?: boolean | ProfileLinkCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProfileLinkIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ProfileLinkIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ProfileLinkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProfileLink"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      clicks: Prisma.$ClickEventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      title: string
      url: string
      iconUrl: string | null
      position: number
      enabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["profileLink"]>
    composites: {}
  }

  type ProfileLinkGetPayload<S extends boolean | null | undefined | ProfileLinkDefaultArgs> = $Result.GetResult<Prisma.$ProfileLinkPayload, S>

  type ProfileLinkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProfileLinkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProfileLinkCountAggregateInputType | true
    }

  export interface ProfileLinkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProfileLink'], meta: { name: 'ProfileLink' } }
    /**
     * Find zero or one ProfileLink that matches the filter.
     * @param {ProfileLinkFindUniqueArgs} args - Arguments to find a ProfileLink
     * @example
     * // Get one ProfileLink
     * const profileLink = await prisma.profileLink.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProfileLinkFindUniqueArgs>(args: SelectSubset<T, ProfileLinkFindUniqueArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProfileLink that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProfileLinkFindUniqueOrThrowArgs} args - Arguments to find a ProfileLink
     * @example
     * // Get one ProfileLink
     * const profileLink = await prisma.profileLink.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProfileLinkFindUniqueOrThrowArgs>(args: SelectSubset<T, ProfileLinkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProfileLink that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkFindFirstArgs} args - Arguments to find a ProfileLink
     * @example
     * // Get one ProfileLink
     * const profileLink = await prisma.profileLink.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProfileLinkFindFirstArgs>(args?: SelectSubset<T, ProfileLinkFindFirstArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProfileLink that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkFindFirstOrThrowArgs} args - Arguments to find a ProfileLink
     * @example
     * // Get one ProfileLink
     * const profileLink = await prisma.profileLink.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProfileLinkFindFirstOrThrowArgs>(args?: SelectSubset<T, ProfileLinkFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProfileLinks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProfileLinks
     * const profileLinks = await prisma.profileLink.findMany()
     * 
     * // Get first 10 ProfileLinks
     * const profileLinks = await prisma.profileLink.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const profileLinkWithIdOnly = await prisma.profileLink.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProfileLinkFindManyArgs>(args?: SelectSubset<T, ProfileLinkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProfileLink.
     * @param {ProfileLinkCreateArgs} args - Arguments to create a ProfileLink.
     * @example
     * // Create one ProfileLink
     * const ProfileLink = await prisma.profileLink.create({
     *   data: {
     *     // ... data to create a ProfileLink
     *   }
     * })
     * 
     */
    create<T extends ProfileLinkCreateArgs>(args: SelectSubset<T, ProfileLinkCreateArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProfileLinks.
     * @param {ProfileLinkCreateManyArgs} args - Arguments to create many ProfileLinks.
     * @example
     * // Create many ProfileLinks
     * const profileLink = await prisma.profileLink.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProfileLinkCreateManyArgs>(args?: SelectSubset<T, ProfileLinkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProfileLinks and returns the data saved in the database.
     * @param {ProfileLinkCreateManyAndReturnArgs} args - Arguments to create many ProfileLinks.
     * @example
     * // Create many ProfileLinks
     * const profileLink = await prisma.profileLink.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProfileLinks and only return the `id`
     * const profileLinkWithIdOnly = await prisma.profileLink.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProfileLinkCreateManyAndReturnArgs>(args?: SelectSubset<T, ProfileLinkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProfileLink.
     * @param {ProfileLinkDeleteArgs} args - Arguments to delete one ProfileLink.
     * @example
     * // Delete one ProfileLink
     * const ProfileLink = await prisma.profileLink.delete({
     *   where: {
     *     // ... filter to delete one ProfileLink
     *   }
     * })
     * 
     */
    delete<T extends ProfileLinkDeleteArgs>(args: SelectSubset<T, ProfileLinkDeleteArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProfileLink.
     * @param {ProfileLinkUpdateArgs} args - Arguments to update one ProfileLink.
     * @example
     * // Update one ProfileLink
     * const profileLink = await prisma.profileLink.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProfileLinkUpdateArgs>(args: SelectSubset<T, ProfileLinkUpdateArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProfileLinks.
     * @param {ProfileLinkDeleteManyArgs} args - Arguments to filter ProfileLinks to delete.
     * @example
     * // Delete a few ProfileLinks
     * const { count } = await prisma.profileLink.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProfileLinkDeleteManyArgs>(args?: SelectSubset<T, ProfileLinkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProfileLinks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProfileLinks
     * const profileLink = await prisma.profileLink.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProfileLinkUpdateManyArgs>(args: SelectSubset<T, ProfileLinkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProfileLinks and returns the data updated in the database.
     * @param {ProfileLinkUpdateManyAndReturnArgs} args - Arguments to update many ProfileLinks.
     * @example
     * // Update many ProfileLinks
     * const profileLink = await prisma.profileLink.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProfileLinks and only return the `id`
     * const profileLinkWithIdOnly = await prisma.profileLink.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProfileLinkUpdateManyAndReturnArgs>(args: SelectSubset<T, ProfileLinkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProfileLink.
     * @param {ProfileLinkUpsertArgs} args - Arguments to update or create a ProfileLink.
     * @example
     * // Update or create a ProfileLink
     * const profileLink = await prisma.profileLink.upsert({
     *   create: {
     *     // ... data to create a ProfileLink
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProfileLink we want to update
     *   }
     * })
     */
    upsert<T extends ProfileLinkUpsertArgs>(args: SelectSubset<T, ProfileLinkUpsertArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProfileLinks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkCountArgs} args - Arguments to filter ProfileLinks to count.
     * @example
     * // Count the number of ProfileLinks
     * const count = await prisma.profileLink.count({
     *   where: {
     *     // ... the filter for the ProfileLinks we want to count
     *   }
     * })
    **/
    count<T extends ProfileLinkCountArgs>(
      args?: Subset<T, ProfileLinkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProfileLinkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProfileLink.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProfileLinkAggregateArgs>(args: Subset<T, ProfileLinkAggregateArgs>): Prisma.PrismaPromise<GetProfileLinkAggregateType<T>>

    /**
     * Group by ProfileLink.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileLinkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProfileLinkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProfileLinkGroupByArgs['orderBy'] }
        : { orderBy?: ProfileLinkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProfileLinkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfileLinkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProfileLink model
   */
  readonly fields: ProfileLinkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProfileLink.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProfileLinkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    clicks<T extends ProfileLink$clicksArgs<ExtArgs> = {}>(args?: Subset<T, ProfileLink$clicksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProfileLink model
   */
  interface ProfileLinkFieldRefs {
    readonly id: FieldRef<"ProfileLink", 'String'>
    readonly userId: FieldRef<"ProfileLink", 'String'>
    readonly title: FieldRef<"ProfileLink", 'String'>
    readonly url: FieldRef<"ProfileLink", 'String'>
    readonly iconUrl: FieldRef<"ProfileLink", 'String'>
    readonly position: FieldRef<"ProfileLink", 'Int'>
    readonly enabled: FieldRef<"ProfileLink", 'Boolean'>
    readonly createdAt: FieldRef<"ProfileLink", 'DateTime'>
    readonly updatedAt: FieldRef<"ProfileLink", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProfileLink findUnique
   */
  export type ProfileLinkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * Filter, which ProfileLink to fetch.
     */
    where: ProfileLinkWhereUniqueInput
  }

  /**
   * ProfileLink findUniqueOrThrow
   */
  export type ProfileLinkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * Filter, which ProfileLink to fetch.
     */
    where: ProfileLinkWhereUniqueInput
  }

  /**
   * ProfileLink findFirst
   */
  export type ProfileLinkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * Filter, which ProfileLink to fetch.
     */
    where?: ProfileLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileLinks to fetch.
     */
    orderBy?: ProfileLinkOrderByWithRelationInput | ProfileLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProfileLinks.
     */
    cursor?: ProfileLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProfileLinks.
     */
    distinct?: ProfileLinkScalarFieldEnum | ProfileLinkScalarFieldEnum[]
  }

  /**
   * ProfileLink findFirstOrThrow
   */
  export type ProfileLinkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * Filter, which ProfileLink to fetch.
     */
    where?: ProfileLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileLinks to fetch.
     */
    orderBy?: ProfileLinkOrderByWithRelationInput | ProfileLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProfileLinks.
     */
    cursor?: ProfileLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileLinks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProfileLinks.
     */
    distinct?: ProfileLinkScalarFieldEnum | ProfileLinkScalarFieldEnum[]
  }

  /**
   * ProfileLink findMany
   */
  export type ProfileLinkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * Filter, which ProfileLinks to fetch.
     */
    where?: ProfileLinkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileLinks to fetch.
     */
    orderBy?: ProfileLinkOrderByWithRelationInput | ProfileLinkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProfileLinks.
     */
    cursor?: ProfileLinkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileLinks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileLinks.
     */
    skip?: number
    distinct?: ProfileLinkScalarFieldEnum | ProfileLinkScalarFieldEnum[]
  }

  /**
   * ProfileLink create
   */
  export type ProfileLinkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * The data needed to create a ProfileLink.
     */
    data: XOR<ProfileLinkCreateInput, ProfileLinkUncheckedCreateInput>
  }

  /**
   * ProfileLink createMany
   */
  export type ProfileLinkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProfileLinks.
     */
    data: ProfileLinkCreateManyInput | ProfileLinkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProfileLink createManyAndReturn
   */
  export type ProfileLinkCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * The data used to create many ProfileLinks.
     */
    data: ProfileLinkCreateManyInput | ProfileLinkCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProfileLink update
   */
  export type ProfileLinkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * The data needed to update a ProfileLink.
     */
    data: XOR<ProfileLinkUpdateInput, ProfileLinkUncheckedUpdateInput>
    /**
     * Choose, which ProfileLink to update.
     */
    where: ProfileLinkWhereUniqueInput
  }

  /**
   * ProfileLink updateMany
   */
  export type ProfileLinkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProfileLinks.
     */
    data: XOR<ProfileLinkUpdateManyMutationInput, ProfileLinkUncheckedUpdateManyInput>
    /**
     * Filter which ProfileLinks to update
     */
    where?: ProfileLinkWhereInput
    /**
     * Limit how many ProfileLinks to update.
     */
    limit?: number
  }

  /**
   * ProfileLink updateManyAndReturn
   */
  export type ProfileLinkUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * The data used to update ProfileLinks.
     */
    data: XOR<ProfileLinkUpdateManyMutationInput, ProfileLinkUncheckedUpdateManyInput>
    /**
     * Filter which ProfileLinks to update
     */
    where?: ProfileLinkWhereInput
    /**
     * Limit how many ProfileLinks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ProfileLink upsert
   */
  export type ProfileLinkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * The filter to search for the ProfileLink to update in case it exists.
     */
    where: ProfileLinkWhereUniqueInput
    /**
     * In case the ProfileLink found by the `where` argument doesn't exist, create a new ProfileLink with this data.
     */
    create: XOR<ProfileLinkCreateInput, ProfileLinkUncheckedCreateInput>
    /**
     * In case the ProfileLink was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProfileLinkUpdateInput, ProfileLinkUncheckedUpdateInput>
  }

  /**
   * ProfileLink delete
   */
  export type ProfileLinkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
    /**
     * Filter which ProfileLink to delete.
     */
    where: ProfileLinkWhereUniqueInput
  }

  /**
   * ProfileLink deleteMany
   */
  export type ProfileLinkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProfileLinks to delete
     */
    where?: ProfileLinkWhereInput
    /**
     * Limit how many ProfileLinks to delete.
     */
    limit?: number
  }

  /**
   * ProfileLink.clicks
   */
  export type ProfileLink$clicksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    where?: ClickEventWhereInput
    orderBy?: ClickEventOrderByWithRelationInput | ClickEventOrderByWithRelationInput[]
    cursor?: ClickEventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClickEventScalarFieldEnum | ClickEventScalarFieldEnum[]
  }

  /**
   * ProfileLink without action
   */
  export type ProfileLinkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileLink
     */
    select?: ProfileLinkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileLink
     */
    omit?: ProfileLinkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProfileLinkInclude<ExtArgs> | null
  }


  /**
   * Model ClickEvent
   */

  export type AggregateClickEvent = {
    _count: ClickEventCountAggregateOutputType | null
    _min: ClickEventMinAggregateOutputType | null
    _max: ClickEventMaxAggregateOutputType | null
  }

  export type ClickEventMinAggregateOutputType = {
    id: string | null
    linkId: string | null
    userId: string | null
    createdAt: Date | null
    referrer: string | null
    userAgent: string | null
    country: string | null
    visitorHash: string | null
  }

  export type ClickEventMaxAggregateOutputType = {
    id: string | null
    linkId: string | null
    userId: string | null
    createdAt: Date | null
    referrer: string | null
    userAgent: string | null
    country: string | null
    visitorHash: string | null
  }

  export type ClickEventCountAggregateOutputType = {
    id: number
    linkId: number
    userId: number
    createdAt: number
    referrer: number
    userAgent: number
    country: number
    visitorHash: number
    _all: number
  }


  export type ClickEventMinAggregateInputType = {
    id?: true
    linkId?: true
    userId?: true
    createdAt?: true
    referrer?: true
    userAgent?: true
    country?: true
    visitorHash?: true
  }

  export type ClickEventMaxAggregateInputType = {
    id?: true
    linkId?: true
    userId?: true
    createdAt?: true
    referrer?: true
    userAgent?: true
    country?: true
    visitorHash?: true
  }

  export type ClickEventCountAggregateInputType = {
    id?: true
    linkId?: true
    userId?: true
    createdAt?: true
    referrer?: true
    userAgent?: true
    country?: true
    visitorHash?: true
    _all?: true
  }

  export type ClickEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClickEvent to aggregate.
     */
    where?: ClickEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClickEvents to fetch.
     */
    orderBy?: ClickEventOrderByWithRelationInput | ClickEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClickEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClickEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClickEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClickEvents
    **/
    _count?: true | ClickEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClickEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClickEventMaxAggregateInputType
  }

  export type GetClickEventAggregateType<T extends ClickEventAggregateArgs> = {
        [P in keyof T & keyof AggregateClickEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClickEvent[P]>
      : GetScalarType<T[P], AggregateClickEvent[P]>
  }




  export type ClickEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClickEventWhereInput
    orderBy?: ClickEventOrderByWithAggregationInput | ClickEventOrderByWithAggregationInput[]
    by: ClickEventScalarFieldEnum[] | ClickEventScalarFieldEnum
    having?: ClickEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClickEventCountAggregateInputType | true
    _min?: ClickEventMinAggregateInputType
    _max?: ClickEventMaxAggregateInputType
  }

  export type ClickEventGroupByOutputType = {
    id: string
    linkId: string
    userId: string
    createdAt: Date
    referrer: string | null
    userAgent: string | null
    country: string | null
    visitorHash: string | null
    _count: ClickEventCountAggregateOutputType | null
    _min: ClickEventMinAggregateOutputType | null
    _max: ClickEventMaxAggregateOutputType | null
  }

  type GetClickEventGroupByPayload<T extends ClickEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClickEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClickEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClickEventGroupByOutputType[P]>
            : GetScalarType<T[P], ClickEventGroupByOutputType[P]>
        }
      >
    >


  export type ClickEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    linkId?: boolean
    userId?: boolean
    createdAt?: boolean
    referrer?: boolean
    userAgent?: boolean
    country?: boolean
    visitorHash?: boolean
    link?: boolean | ProfileLinkDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clickEvent"]>

  export type ClickEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    linkId?: boolean
    userId?: boolean
    createdAt?: boolean
    referrer?: boolean
    userAgent?: boolean
    country?: boolean
    visitorHash?: boolean
    link?: boolean | ProfileLinkDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clickEvent"]>

  export type ClickEventSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    linkId?: boolean
    userId?: boolean
    createdAt?: boolean
    referrer?: boolean
    userAgent?: boolean
    country?: boolean
    visitorHash?: boolean
    link?: boolean | ProfileLinkDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clickEvent"]>

  export type ClickEventSelectScalar = {
    id?: boolean
    linkId?: boolean
    userId?: boolean
    createdAt?: boolean
    referrer?: boolean
    userAgent?: boolean
    country?: boolean
    visitorHash?: boolean
  }

  export type ClickEventOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "linkId" | "userId" | "createdAt" | "referrer" | "userAgent" | "country" | "visitorHash", ExtArgs["result"]["clickEvent"]>
  export type ClickEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    link?: boolean | ProfileLinkDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ClickEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    link?: boolean | ProfileLinkDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ClickEventIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    link?: boolean | ProfileLinkDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ClickEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClickEvent"
    objects: {
      link: Prisma.$ProfileLinkPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      linkId: string
      userId: string
      createdAt: Date
      referrer: string | null
      userAgent: string | null
      country: string | null
      visitorHash: string | null
    }, ExtArgs["result"]["clickEvent"]>
    composites: {}
  }

  type ClickEventGetPayload<S extends boolean | null | undefined | ClickEventDefaultArgs> = $Result.GetResult<Prisma.$ClickEventPayload, S>

  type ClickEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClickEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClickEventCountAggregateInputType | true
    }

  export interface ClickEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClickEvent'], meta: { name: 'ClickEvent' } }
    /**
     * Find zero or one ClickEvent that matches the filter.
     * @param {ClickEventFindUniqueArgs} args - Arguments to find a ClickEvent
     * @example
     * // Get one ClickEvent
     * const clickEvent = await prisma.clickEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClickEventFindUniqueArgs>(args: SelectSubset<T, ClickEventFindUniqueArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClickEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClickEventFindUniqueOrThrowArgs} args - Arguments to find a ClickEvent
     * @example
     * // Get one ClickEvent
     * const clickEvent = await prisma.clickEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClickEventFindUniqueOrThrowArgs>(args: SelectSubset<T, ClickEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClickEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventFindFirstArgs} args - Arguments to find a ClickEvent
     * @example
     * // Get one ClickEvent
     * const clickEvent = await prisma.clickEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClickEventFindFirstArgs>(args?: SelectSubset<T, ClickEventFindFirstArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClickEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventFindFirstOrThrowArgs} args - Arguments to find a ClickEvent
     * @example
     * // Get one ClickEvent
     * const clickEvent = await prisma.clickEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClickEventFindFirstOrThrowArgs>(args?: SelectSubset<T, ClickEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClickEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClickEvents
     * const clickEvents = await prisma.clickEvent.findMany()
     * 
     * // Get first 10 ClickEvents
     * const clickEvents = await prisma.clickEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clickEventWithIdOnly = await prisma.clickEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClickEventFindManyArgs>(args?: SelectSubset<T, ClickEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClickEvent.
     * @param {ClickEventCreateArgs} args - Arguments to create a ClickEvent.
     * @example
     * // Create one ClickEvent
     * const ClickEvent = await prisma.clickEvent.create({
     *   data: {
     *     // ... data to create a ClickEvent
     *   }
     * })
     * 
     */
    create<T extends ClickEventCreateArgs>(args: SelectSubset<T, ClickEventCreateArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClickEvents.
     * @param {ClickEventCreateManyArgs} args - Arguments to create many ClickEvents.
     * @example
     * // Create many ClickEvents
     * const clickEvent = await prisma.clickEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClickEventCreateManyArgs>(args?: SelectSubset<T, ClickEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClickEvents and returns the data saved in the database.
     * @param {ClickEventCreateManyAndReturnArgs} args - Arguments to create many ClickEvents.
     * @example
     * // Create many ClickEvents
     * const clickEvent = await prisma.clickEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClickEvents and only return the `id`
     * const clickEventWithIdOnly = await prisma.clickEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClickEventCreateManyAndReturnArgs>(args?: SelectSubset<T, ClickEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClickEvent.
     * @param {ClickEventDeleteArgs} args - Arguments to delete one ClickEvent.
     * @example
     * // Delete one ClickEvent
     * const ClickEvent = await prisma.clickEvent.delete({
     *   where: {
     *     // ... filter to delete one ClickEvent
     *   }
     * })
     * 
     */
    delete<T extends ClickEventDeleteArgs>(args: SelectSubset<T, ClickEventDeleteArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClickEvent.
     * @param {ClickEventUpdateArgs} args - Arguments to update one ClickEvent.
     * @example
     * // Update one ClickEvent
     * const clickEvent = await prisma.clickEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClickEventUpdateArgs>(args: SelectSubset<T, ClickEventUpdateArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClickEvents.
     * @param {ClickEventDeleteManyArgs} args - Arguments to filter ClickEvents to delete.
     * @example
     * // Delete a few ClickEvents
     * const { count } = await prisma.clickEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClickEventDeleteManyArgs>(args?: SelectSubset<T, ClickEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClickEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClickEvents
     * const clickEvent = await prisma.clickEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClickEventUpdateManyArgs>(args: SelectSubset<T, ClickEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClickEvents and returns the data updated in the database.
     * @param {ClickEventUpdateManyAndReturnArgs} args - Arguments to update many ClickEvents.
     * @example
     * // Update many ClickEvents
     * const clickEvent = await prisma.clickEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClickEvents and only return the `id`
     * const clickEventWithIdOnly = await prisma.clickEvent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClickEventUpdateManyAndReturnArgs>(args: SelectSubset<T, ClickEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClickEvent.
     * @param {ClickEventUpsertArgs} args - Arguments to update or create a ClickEvent.
     * @example
     * // Update or create a ClickEvent
     * const clickEvent = await prisma.clickEvent.upsert({
     *   create: {
     *     // ... data to create a ClickEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClickEvent we want to update
     *   }
     * })
     */
    upsert<T extends ClickEventUpsertArgs>(args: SelectSubset<T, ClickEventUpsertArgs<ExtArgs>>): Prisma__ClickEventClient<$Result.GetResult<Prisma.$ClickEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClickEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventCountArgs} args - Arguments to filter ClickEvents to count.
     * @example
     * // Count the number of ClickEvents
     * const count = await prisma.clickEvent.count({
     *   where: {
     *     // ... the filter for the ClickEvents we want to count
     *   }
     * })
    **/
    count<T extends ClickEventCountArgs>(
      args?: Subset<T, ClickEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClickEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClickEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClickEventAggregateArgs>(args: Subset<T, ClickEventAggregateArgs>): Prisma.PrismaPromise<GetClickEventAggregateType<T>>

    /**
     * Group by ClickEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClickEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClickEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClickEventGroupByArgs['orderBy'] }
        : { orderBy?: ClickEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClickEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClickEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClickEvent model
   */
  readonly fields: ClickEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClickEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClickEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    link<T extends ProfileLinkDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProfileLinkDefaultArgs<ExtArgs>>): Prisma__ProfileLinkClient<$Result.GetResult<Prisma.$ProfileLinkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClickEvent model
   */
  interface ClickEventFieldRefs {
    readonly id: FieldRef<"ClickEvent", 'String'>
    readonly linkId: FieldRef<"ClickEvent", 'String'>
    readonly userId: FieldRef<"ClickEvent", 'String'>
    readonly createdAt: FieldRef<"ClickEvent", 'DateTime'>
    readonly referrer: FieldRef<"ClickEvent", 'String'>
    readonly userAgent: FieldRef<"ClickEvent", 'String'>
    readonly country: FieldRef<"ClickEvent", 'String'>
    readonly visitorHash: FieldRef<"ClickEvent", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ClickEvent findUnique
   */
  export type ClickEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * Filter, which ClickEvent to fetch.
     */
    where: ClickEventWhereUniqueInput
  }

  /**
   * ClickEvent findUniqueOrThrow
   */
  export type ClickEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * Filter, which ClickEvent to fetch.
     */
    where: ClickEventWhereUniqueInput
  }

  /**
   * ClickEvent findFirst
   */
  export type ClickEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * Filter, which ClickEvent to fetch.
     */
    where?: ClickEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClickEvents to fetch.
     */
    orderBy?: ClickEventOrderByWithRelationInput | ClickEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClickEvents.
     */
    cursor?: ClickEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClickEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClickEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClickEvents.
     */
    distinct?: ClickEventScalarFieldEnum | ClickEventScalarFieldEnum[]
  }

  /**
   * ClickEvent findFirstOrThrow
   */
  export type ClickEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * Filter, which ClickEvent to fetch.
     */
    where?: ClickEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClickEvents to fetch.
     */
    orderBy?: ClickEventOrderByWithRelationInput | ClickEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClickEvents.
     */
    cursor?: ClickEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClickEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClickEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClickEvents.
     */
    distinct?: ClickEventScalarFieldEnum | ClickEventScalarFieldEnum[]
  }

  /**
   * ClickEvent findMany
   */
  export type ClickEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * Filter, which ClickEvents to fetch.
     */
    where?: ClickEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClickEvents to fetch.
     */
    orderBy?: ClickEventOrderByWithRelationInput | ClickEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClickEvents.
     */
    cursor?: ClickEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClickEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClickEvents.
     */
    skip?: number
    distinct?: ClickEventScalarFieldEnum | ClickEventScalarFieldEnum[]
  }

  /**
   * ClickEvent create
   */
  export type ClickEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * The data needed to create a ClickEvent.
     */
    data: XOR<ClickEventCreateInput, ClickEventUncheckedCreateInput>
  }

  /**
   * ClickEvent createMany
   */
  export type ClickEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClickEvents.
     */
    data: ClickEventCreateManyInput | ClickEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClickEvent createManyAndReturn
   */
  export type ClickEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * The data used to create many ClickEvents.
     */
    data: ClickEventCreateManyInput | ClickEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClickEvent update
   */
  export type ClickEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * The data needed to update a ClickEvent.
     */
    data: XOR<ClickEventUpdateInput, ClickEventUncheckedUpdateInput>
    /**
     * Choose, which ClickEvent to update.
     */
    where: ClickEventWhereUniqueInput
  }

  /**
   * ClickEvent updateMany
   */
  export type ClickEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClickEvents.
     */
    data: XOR<ClickEventUpdateManyMutationInput, ClickEventUncheckedUpdateManyInput>
    /**
     * Filter which ClickEvents to update
     */
    where?: ClickEventWhereInput
    /**
     * Limit how many ClickEvents to update.
     */
    limit?: number
  }

  /**
   * ClickEvent updateManyAndReturn
   */
  export type ClickEventUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * The data used to update ClickEvents.
     */
    data: XOR<ClickEventUpdateManyMutationInput, ClickEventUncheckedUpdateManyInput>
    /**
     * Filter which ClickEvents to update
     */
    where?: ClickEventWhereInput
    /**
     * Limit how many ClickEvents to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClickEvent upsert
   */
  export type ClickEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * The filter to search for the ClickEvent to update in case it exists.
     */
    where: ClickEventWhereUniqueInput
    /**
     * In case the ClickEvent found by the `where` argument doesn't exist, create a new ClickEvent with this data.
     */
    create: XOR<ClickEventCreateInput, ClickEventUncheckedCreateInput>
    /**
     * In case the ClickEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClickEventUpdateInput, ClickEventUncheckedUpdateInput>
  }

  /**
   * ClickEvent delete
   */
  export type ClickEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
    /**
     * Filter which ClickEvent to delete.
     */
    where: ClickEventWhereUniqueInput
  }

  /**
   * ClickEvent deleteMany
   */
  export type ClickEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClickEvents to delete
     */
    where?: ClickEventWhereInput
    /**
     * Limit how many ClickEvents to delete.
     */
    limit?: number
  }

  /**
   * ClickEvent without action
   */
  export type ClickEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClickEvent
     */
    select?: ClickEventSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClickEvent
     */
    omit?: ClickEventOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClickEventInclude<ExtArgs> | null
  }


  /**
   * Model AuthIntent
   */

  export type AggregateAuthIntent = {
    _count: AuthIntentCountAggregateOutputType | null
    _min: AuthIntentMinAggregateOutputType | null
    _max: AuthIntentMaxAggregateOutputType | null
  }

  export type AuthIntentMinAggregateOutputType = {
    id: string | null
    token: string | null
    email: string | null
    username: string | null
    usernameNormalized: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type AuthIntentMaxAggregateOutputType = {
    id: string | null
    token: string | null
    email: string | null
    username: string | null
    usernameNormalized: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type AuthIntentCountAggregateOutputType = {
    id: number
    token: number
    email: number
    username: number
    usernameNormalized: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type AuthIntentMinAggregateInputType = {
    id?: true
    token?: true
    email?: true
    username?: true
    usernameNormalized?: true
    expiresAt?: true
    createdAt?: true
  }

  export type AuthIntentMaxAggregateInputType = {
    id?: true
    token?: true
    email?: true
    username?: true
    usernameNormalized?: true
    expiresAt?: true
    createdAt?: true
  }

  export type AuthIntentCountAggregateInputType = {
    id?: true
    token?: true
    email?: true
    username?: true
    usernameNormalized?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type AuthIntentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthIntent to aggregate.
     */
    where?: AuthIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthIntents to fetch.
     */
    orderBy?: AuthIntentOrderByWithRelationInput | AuthIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthIntents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthIntents
    **/
    _count?: true | AuthIntentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthIntentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthIntentMaxAggregateInputType
  }

  export type GetAuthIntentAggregateType<T extends AuthIntentAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthIntent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthIntent[P]>
      : GetScalarType<T[P], AggregateAuthIntent[P]>
  }




  export type AuthIntentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthIntentWhereInput
    orderBy?: AuthIntentOrderByWithAggregationInput | AuthIntentOrderByWithAggregationInput[]
    by: AuthIntentScalarFieldEnum[] | AuthIntentScalarFieldEnum
    having?: AuthIntentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthIntentCountAggregateInputType | true
    _min?: AuthIntentMinAggregateInputType
    _max?: AuthIntentMaxAggregateInputType
  }

  export type AuthIntentGroupByOutputType = {
    id: string
    token: string
    email: string
    username: string
    usernameNormalized: string
    expiresAt: Date
    createdAt: Date
    _count: AuthIntentCountAggregateOutputType | null
    _min: AuthIntentMinAggregateOutputType | null
    _max: AuthIntentMaxAggregateOutputType | null
  }

  type GetAuthIntentGroupByPayload<T extends AuthIntentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthIntentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthIntentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthIntentGroupByOutputType[P]>
            : GetScalarType<T[P], AuthIntentGroupByOutputType[P]>
        }
      >
    >


  export type AuthIntentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    email?: boolean
    username?: boolean
    usernameNormalized?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["authIntent"]>

  export type AuthIntentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    email?: boolean
    username?: boolean
    usernameNormalized?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["authIntent"]>

  export type AuthIntentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    email?: boolean
    username?: boolean
    usernameNormalized?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["authIntent"]>

  export type AuthIntentSelectScalar = {
    id?: boolean
    token?: boolean
    email?: boolean
    username?: boolean
    usernameNormalized?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type AuthIntentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "token" | "email" | "username" | "usernameNormalized" | "expiresAt" | "createdAt", ExtArgs["result"]["authIntent"]>

  export type $AuthIntentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthIntent"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      token: string
      email: string
      username: string
      usernameNormalized: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["authIntent"]>
    composites: {}
  }

  type AuthIntentGetPayload<S extends boolean | null | undefined | AuthIntentDefaultArgs> = $Result.GetResult<Prisma.$AuthIntentPayload, S>

  type AuthIntentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuthIntentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuthIntentCountAggregateInputType | true
    }

  export interface AuthIntentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthIntent'], meta: { name: 'AuthIntent' } }
    /**
     * Find zero or one AuthIntent that matches the filter.
     * @param {AuthIntentFindUniqueArgs} args - Arguments to find a AuthIntent
     * @example
     * // Get one AuthIntent
     * const authIntent = await prisma.authIntent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthIntentFindUniqueArgs>(args: SelectSubset<T, AuthIntentFindUniqueArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuthIntent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthIntentFindUniqueOrThrowArgs} args - Arguments to find a AuthIntent
     * @example
     * // Get one AuthIntent
     * const authIntent = await prisma.authIntent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthIntentFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthIntentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthIntent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentFindFirstArgs} args - Arguments to find a AuthIntent
     * @example
     * // Get one AuthIntent
     * const authIntent = await prisma.authIntent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthIntentFindFirstArgs>(args?: SelectSubset<T, AuthIntentFindFirstArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuthIntent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentFindFirstOrThrowArgs} args - Arguments to find a AuthIntent
     * @example
     * // Get one AuthIntent
     * const authIntent = await prisma.authIntent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthIntentFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthIntentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuthIntents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthIntents
     * const authIntents = await prisma.authIntent.findMany()
     * 
     * // Get first 10 AuthIntents
     * const authIntents = await prisma.authIntent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authIntentWithIdOnly = await prisma.authIntent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthIntentFindManyArgs>(args?: SelectSubset<T, AuthIntentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuthIntent.
     * @param {AuthIntentCreateArgs} args - Arguments to create a AuthIntent.
     * @example
     * // Create one AuthIntent
     * const AuthIntent = await prisma.authIntent.create({
     *   data: {
     *     // ... data to create a AuthIntent
     *   }
     * })
     * 
     */
    create<T extends AuthIntentCreateArgs>(args: SelectSubset<T, AuthIntentCreateArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuthIntents.
     * @param {AuthIntentCreateManyArgs} args - Arguments to create many AuthIntents.
     * @example
     * // Create many AuthIntents
     * const authIntent = await prisma.authIntent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthIntentCreateManyArgs>(args?: SelectSubset<T, AuthIntentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthIntents and returns the data saved in the database.
     * @param {AuthIntentCreateManyAndReturnArgs} args - Arguments to create many AuthIntents.
     * @example
     * // Create many AuthIntents
     * const authIntent = await prisma.authIntent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthIntents and only return the `id`
     * const authIntentWithIdOnly = await prisma.authIntent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthIntentCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthIntentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuthIntent.
     * @param {AuthIntentDeleteArgs} args - Arguments to delete one AuthIntent.
     * @example
     * // Delete one AuthIntent
     * const AuthIntent = await prisma.authIntent.delete({
     *   where: {
     *     // ... filter to delete one AuthIntent
     *   }
     * })
     * 
     */
    delete<T extends AuthIntentDeleteArgs>(args: SelectSubset<T, AuthIntentDeleteArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuthIntent.
     * @param {AuthIntentUpdateArgs} args - Arguments to update one AuthIntent.
     * @example
     * // Update one AuthIntent
     * const authIntent = await prisma.authIntent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthIntentUpdateArgs>(args: SelectSubset<T, AuthIntentUpdateArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuthIntents.
     * @param {AuthIntentDeleteManyArgs} args - Arguments to filter AuthIntents to delete.
     * @example
     * // Delete a few AuthIntents
     * const { count } = await prisma.authIntent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthIntentDeleteManyArgs>(args?: SelectSubset<T, AuthIntentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthIntents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthIntents
     * const authIntent = await prisma.authIntent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthIntentUpdateManyArgs>(args: SelectSubset<T, AuthIntentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthIntents and returns the data updated in the database.
     * @param {AuthIntentUpdateManyAndReturnArgs} args - Arguments to update many AuthIntents.
     * @example
     * // Update many AuthIntents
     * const authIntent = await prisma.authIntent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuthIntents and only return the `id`
     * const authIntentWithIdOnly = await prisma.authIntent.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthIntentUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthIntentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuthIntent.
     * @param {AuthIntentUpsertArgs} args - Arguments to update or create a AuthIntent.
     * @example
     * // Update or create a AuthIntent
     * const authIntent = await prisma.authIntent.upsert({
     *   create: {
     *     // ... data to create a AuthIntent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthIntent we want to update
     *   }
     * })
     */
    upsert<T extends AuthIntentUpsertArgs>(args: SelectSubset<T, AuthIntentUpsertArgs<ExtArgs>>): Prisma__AuthIntentClient<$Result.GetResult<Prisma.$AuthIntentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuthIntents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentCountArgs} args - Arguments to filter AuthIntents to count.
     * @example
     * // Count the number of AuthIntents
     * const count = await prisma.authIntent.count({
     *   where: {
     *     // ... the filter for the AuthIntents we want to count
     *   }
     * })
    **/
    count<T extends AuthIntentCountArgs>(
      args?: Subset<T, AuthIntentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthIntentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthIntent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthIntentAggregateArgs>(args: Subset<T, AuthIntentAggregateArgs>): Prisma.PrismaPromise<GetAuthIntentAggregateType<T>>

    /**
     * Group by AuthIntent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthIntentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthIntentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthIntentGroupByArgs['orderBy'] }
        : { orderBy?: AuthIntentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthIntentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthIntentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthIntent model
   */
  readonly fields: AuthIntentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthIntent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthIntentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuthIntent model
   */
  interface AuthIntentFieldRefs {
    readonly id: FieldRef<"AuthIntent", 'String'>
    readonly token: FieldRef<"AuthIntent", 'String'>
    readonly email: FieldRef<"AuthIntent", 'String'>
    readonly username: FieldRef<"AuthIntent", 'String'>
    readonly usernameNormalized: FieldRef<"AuthIntent", 'String'>
    readonly expiresAt: FieldRef<"AuthIntent", 'DateTime'>
    readonly createdAt: FieldRef<"AuthIntent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthIntent findUnique
   */
  export type AuthIntentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * Filter, which AuthIntent to fetch.
     */
    where: AuthIntentWhereUniqueInput
  }

  /**
   * AuthIntent findUniqueOrThrow
   */
  export type AuthIntentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * Filter, which AuthIntent to fetch.
     */
    where: AuthIntentWhereUniqueInput
  }

  /**
   * AuthIntent findFirst
   */
  export type AuthIntentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * Filter, which AuthIntent to fetch.
     */
    where?: AuthIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthIntents to fetch.
     */
    orderBy?: AuthIntentOrderByWithRelationInput | AuthIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthIntents.
     */
    cursor?: AuthIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthIntents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthIntents.
     */
    distinct?: AuthIntentScalarFieldEnum | AuthIntentScalarFieldEnum[]
  }

  /**
   * AuthIntent findFirstOrThrow
   */
  export type AuthIntentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * Filter, which AuthIntent to fetch.
     */
    where?: AuthIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthIntents to fetch.
     */
    orderBy?: AuthIntentOrderByWithRelationInput | AuthIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthIntents.
     */
    cursor?: AuthIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthIntents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthIntents.
     */
    distinct?: AuthIntentScalarFieldEnum | AuthIntentScalarFieldEnum[]
  }

  /**
   * AuthIntent findMany
   */
  export type AuthIntentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * Filter, which AuthIntents to fetch.
     */
    where?: AuthIntentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthIntents to fetch.
     */
    orderBy?: AuthIntentOrderByWithRelationInput | AuthIntentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthIntents.
     */
    cursor?: AuthIntentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthIntents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthIntents.
     */
    skip?: number
    distinct?: AuthIntentScalarFieldEnum | AuthIntentScalarFieldEnum[]
  }

  /**
   * AuthIntent create
   */
  export type AuthIntentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * The data needed to create a AuthIntent.
     */
    data: XOR<AuthIntentCreateInput, AuthIntentUncheckedCreateInput>
  }

  /**
   * AuthIntent createMany
   */
  export type AuthIntentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthIntents.
     */
    data: AuthIntentCreateManyInput | AuthIntentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthIntent createManyAndReturn
   */
  export type AuthIntentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * The data used to create many AuthIntents.
     */
    data: AuthIntentCreateManyInput | AuthIntentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthIntent update
   */
  export type AuthIntentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * The data needed to update a AuthIntent.
     */
    data: XOR<AuthIntentUpdateInput, AuthIntentUncheckedUpdateInput>
    /**
     * Choose, which AuthIntent to update.
     */
    where: AuthIntentWhereUniqueInput
  }

  /**
   * AuthIntent updateMany
   */
  export type AuthIntentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthIntents.
     */
    data: XOR<AuthIntentUpdateManyMutationInput, AuthIntentUncheckedUpdateManyInput>
    /**
     * Filter which AuthIntents to update
     */
    where?: AuthIntentWhereInput
    /**
     * Limit how many AuthIntents to update.
     */
    limit?: number
  }

  /**
   * AuthIntent updateManyAndReturn
   */
  export type AuthIntentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * The data used to update AuthIntents.
     */
    data: XOR<AuthIntentUpdateManyMutationInput, AuthIntentUncheckedUpdateManyInput>
    /**
     * Filter which AuthIntents to update
     */
    where?: AuthIntentWhereInput
    /**
     * Limit how many AuthIntents to update.
     */
    limit?: number
  }

  /**
   * AuthIntent upsert
   */
  export type AuthIntentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * The filter to search for the AuthIntent to update in case it exists.
     */
    where: AuthIntentWhereUniqueInput
    /**
     * In case the AuthIntent found by the `where` argument doesn't exist, create a new AuthIntent with this data.
     */
    create: XOR<AuthIntentCreateInput, AuthIntentUncheckedCreateInput>
    /**
     * In case the AuthIntent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthIntentUpdateInput, AuthIntentUncheckedUpdateInput>
  }

  /**
   * AuthIntent delete
   */
  export type AuthIntentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
    /**
     * Filter which AuthIntent to delete.
     */
    where: AuthIntentWhereUniqueInput
  }

  /**
   * AuthIntent deleteMany
   */
  export type AuthIntentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthIntents to delete
     */
    where?: AuthIntentWhereInput
    /**
     * Limit how many AuthIntents to delete.
     */
    limit?: number
  }

  /**
   * AuthIntent without action
   */
  export type AuthIntentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthIntent
     */
    select?: AuthIntentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuthIntent
     */
    omit?: AuthIntentOmit<ExtArgs> | null
  }


  /**
   * Model UsernameBlocklist
   */

  export type AggregateUsernameBlocklist = {
    _count: UsernameBlocklistCountAggregateOutputType | null
    _min: UsernameBlocklistMinAggregateOutputType | null
    _max: UsernameBlocklistMaxAggregateOutputType | null
  }

  export type UsernameBlocklistMinAggregateOutputType = {
    id: string | null
    termNormalized: string | null
    enabled: boolean | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsernameBlocklistMaxAggregateOutputType = {
    id: string | null
    termNormalized: string | null
    enabled: boolean | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsernameBlocklistCountAggregateOutputType = {
    id: number
    termNormalized: number
    enabled: number
    note: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UsernameBlocklistMinAggregateInputType = {
    id?: true
    termNormalized?: true
    enabled?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsernameBlocklistMaxAggregateInputType = {
    id?: true
    termNormalized?: true
    enabled?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsernameBlocklistCountAggregateInputType = {
    id?: true
    termNormalized?: true
    enabled?: true
    note?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UsernameBlocklistAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsernameBlocklist to aggregate.
     */
    where?: UsernameBlocklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsernameBlocklists to fetch.
     */
    orderBy?: UsernameBlocklistOrderByWithRelationInput | UsernameBlocklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsernameBlocklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsernameBlocklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsernameBlocklists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UsernameBlocklists
    **/
    _count?: true | UsernameBlocklistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsernameBlocklistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsernameBlocklistMaxAggregateInputType
  }

  export type GetUsernameBlocklistAggregateType<T extends UsernameBlocklistAggregateArgs> = {
        [P in keyof T & keyof AggregateUsernameBlocklist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsernameBlocklist[P]>
      : GetScalarType<T[P], AggregateUsernameBlocklist[P]>
  }




  export type UsernameBlocklistGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsernameBlocklistWhereInput
    orderBy?: UsernameBlocklistOrderByWithAggregationInput | UsernameBlocklistOrderByWithAggregationInput[]
    by: UsernameBlocklistScalarFieldEnum[] | UsernameBlocklistScalarFieldEnum
    having?: UsernameBlocklistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsernameBlocklistCountAggregateInputType | true
    _min?: UsernameBlocklistMinAggregateInputType
    _max?: UsernameBlocklistMaxAggregateInputType
  }

  export type UsernameBlocklistGroupByOutputType = {
    id: string
    termNormalized: string
    enabled: boolean
    note: string | null
    createdAt: Date
    updatedAt: Date
    _count: UsernameBlocklistCountAggregateOutputType | null
    _min: UsernameBlocklistMinAggregateOutputType | null
    _max: UsernameBlocklistMaxAggregateOutputType | null
  }

  type GetUsernameBlocklistGroupByPayload<T extends UsernameBlocklistGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsernameBlocklistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsernameBlocklistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsernameBlocklistGroupByOutputType[P]>
            : GetScalarType<T[P], UsernameBlocklistGroupByOutputType[P]>
        }
      >
    >


  export type UsernameBlocklistSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    termNormalized?: boolean
    enabled?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["usernameBlocklist"]>

  export type UsernameBlocklistSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    termNormalized?: boolean
    enabled?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["usernameBlocklist"]>

  export type UsernameBlocklistSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    termNormalized?: boolean
    enabled?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["usernameBlocklist"]>

  export type UsernameBlocklistSelectScalar = {
    id?: boolean
    termNormalized?: boolean
    enabled?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UsernameBlocklistOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "termNormalized" | "enabled" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["usernameBlocklist"]>

  export type $UsernameBlocklistPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UsernameBlocklist"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      termNormalized: string
      enabled: boolean
      note: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["usernameBlocklist"]>
    composites: {}
  }

  type UsernameBlocklistGetPayload<S extends boolean | null | undefined | UsernameBlocklistDefaultArgs> = $Result.GetResult<Prisma.$UsernameBlocklistPayload, S>

  type UsernameBlocklistCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsernameBlocklistFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsernameBlocklistCountAggregateInputType | true
    }

  export interface UsernameBlocklistDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UsernameBlocklist'], meta: { name: 'UsernameBlocklist' } }
    /**
     * Find zero or one UsernameBlocklist that matches the filter.
     * @param {UsernameBlocklistFindUniqueArgs} args - Arguments to find a UsernameBlocklist
     * @example
     * // Get one UsernameBlocklist
     * const usernameBlocklist = await prisma.usernameBlocklist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsernameBlocklistFindUniqueArgs>(args: SelectSubset<T, UsernameBlocklistFindUniqueArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UsernameBlocklist that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsernameBlocklistFindUniqueOrThrowArgs} args - Arguments to find a UsernameBlocklist
     * @example
     * // Get one UsernameBlocklist
     * const usernameBlocklist = await prisma.usernameBlocklist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsernameBlocklistFindUniqueOrThrowArgs>(args: SelectSubset<T, UsernameBlocklistFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UsernameBlocklist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistFindFirstArgs} args - Arguments to find a UsernameBlocklist
     * @example
     * // Get one UsernameBlocklist
     * const usernameBlocklist = await prisma.usernameBlocklist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsernameBlocklistFindFirstArgs>(args?: SelectSubset<T, UsernameBlocklistFindFirstArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UsernameBlocklist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistFindFirstOrThrowArgs} args - Arguments to find a UsernameBlocklist
     * @example
     * // Get one UsernameBlocklist
     * const usernameBlocklist = await prisma.usernameBlocklist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsernameBlocklistFindFirstOrThrowArgs>(args?: SelectSubset<T, UsernameBlocklistFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UsernameBlocklists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UsernameBlocklists
     * const usernameBlocklists = await prisma.usernameBlocklist.findMany()
     * 
     * // Get first 10 UsernameBlocklists
     * const usernameBlocklists = await prisma.usernameBlocklist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usernameBlocklistWithIdOnly = await prisma.usernameBlocklist.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsernameBlocklistFindManyArgs>(args?: SelectSubset<T, UsernameBlocklistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UsernameBlocklist.
     * @param {UsernameBlocklistCreateArgs} args - Arguments to create a UsernameBlocklist.
     * @example
     * // Create one UsernameBlocklist
     * const UsernameBlocklist = await prisma.usernameBlocklist.create({
     *   data: {
     *     // ... data to create a UsernameBlocklist
     *   }
     * })
     * 
     */
    create<T extends UsernameBlocklistCreateArgs>(args: SelectSubset<T, UsernameBlocklistCreateArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UsernameBlocklists.
     * @param {UsernameBlocklistCreateManyArgs} args - Arguments to create many UsernameBlocklists.
     * @example
     * // Create many UsernameBlocklists
     * const usernameBlocklist = await prisma.usernameBlocklist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsernameBlocklistCreateManyArgs>(args?: SelectSubset<T, UsernameBlocklistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UsernameBlocklists and returns the data saved in the database.
     * @param {UsernameBlocklistCreateManyAndReturnArgs} args - Arguments to create many UsernameBlocklists.
     * @example
     * // Create many UsernameBlocklists
     * const usernameBlocklist = await prisma.usernameBlocklist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UsernameBlocklists and only return the `id`
     * const usernameBlocklistWithIdOnly = await prisma.usernameBlocklist.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsernameBlocklistCreateManyAndReturnArgs>(args?: SelectSubset<T, UsernameBlocklistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UsernameBlocklist.
     * @param {UsernameBlocklistDeleteArgs} args - Arguments to delete one UsernameBlocklist.
     * @example
     * // Delete one UsernameBlocklist
     * const UsernameBlocklist = await prisma.usernameBlocklist.delete({
     *   where: {
     *     // ... filter to delete one UsernameBlocklist
     *   }
     * })
     * 
     */
    delete<T extends UsernameBlocklistDeleteArgs>(args: SelectSubset<T, UsernameBlocklistDeleteArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UsernameBlocklist.
     * @param {UsernameBlocklistUpdateArgs} args - Arguments to update one UsernameBlocklist.
     * @example
     * // Update one UsernameBlocklist
     * const usernameBlocklist = await prisma.usernameBlocklist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsernameBlocklistUpdateArgs>(args: SelectSubset<T, UsernameBlocklistUpdateArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UsernameBlocklists.
     * @param {UsernameBlocklistDeleteManyArgs} args - Arguments to filter UsernameBlocklists to delete.
     * @example
     * // Delete a few UsernameBlocklists
     * const { count } = await prisma.usernameBlocklist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsernameBlocklistDeleteManyArgs>(args?: SelectSubset<T, UsernameBlocklistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsernameBlocklists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UsernameBlocklists
     * const usernameBlocklist = await prisma.usernameBlocklist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsernameBlocklistUpdateManyArgs>(args: SelectSubset<T, UsernameBlocklistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsernameBlocklists and returns the data updated in the database.
     * @param {UsernameBlocklistUpdateManyAndReturnArgs} args - Arguments to update many UsernameBlocklists.
     * @example
     * // Update many UsernameBlocklists
     * const usernameBlocklist = await prisma.usernameBlocklist.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UsernameBlocklists and only return the `id`
     * const usernameBlocklistWithIdOnly = await prisma.usernameBlocklist.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsernameBlocklistUpdateManyAndReturnArgs>(args: SelectSubset<T, UsernameBlocklistUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UsernameBlocklist.
     * @param {UsernameBlocklistUpsertArgs} args - Arguments to update or create a UsernameBlocklist.
     * @example
     * // Update or create a UsernameBlocklist
     * const usernameBlocklist = await prisma.usernameBlocklist.upsert({
     *   create: {
     *     // ... data to create a UsernameBlocklist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UsernameBlocklist we want to update
     *   }
     * })
     */
    upsert<T extends UsernameBlocklistUpsertArgs>(args: SelectSubset<T, UsernameBlocklistUpsertArgs<ExtArgs>>): Prisma__UsernameBlocklistClient<$Result.GetResult<Prisma.$UsernameBlocklistPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UsernameBlocklists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistCountArgs} args - Arguments to filter UsernameBlocklists to count.
     * @example
     * // Count the number of UsernameBlocklists
     * const count = await prisma.usernameBlocklist.count({
     *   where: {
     *     // ... the filter for the UsernameBlocklists we want to count
     *   }
     * })
    **/
    count<T extends UsernameBlocklistCountArgs>(
      args?: Subset<T, UsernameBlocklistCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsernameBlocklistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UsernameBlocklist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsernameBlocklistAggregateArgs>(args: Subset<T, UsernameBlocklistAggregateArgs>): Prisma.PrismaPromise<GetUsernameBlocklistAggregateType<T>>

    /**
     * Group by UsernameBlocklist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsernameBlocklistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsernameBlocklistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsernameBlocklistGroupByArgs['orderBy'] }
        : { orderBy?: UsernameBlocklistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsernameBlocklistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsernameBlocklistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UsernameBlocklist model
   */
  readonly fields: UsernameBlocklistFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UsernameBlocklist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsernameBlocklistClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UsernameBlocklist model
   */
  interface UsernameBlocklistFieldRefs {
    readonly id: FieldRef<"UsernameBlocklist", 'String'>
    readonly termNormalized: FieldRef<"UsernameBlocklist", 'String'>
    readonly enabled: FieldRef<"UsernameBlocklist", 'Boolean'>
    readonly note: FieldRef<"UsernameBlocklist", 'String'>
    readonly createdAt: FieldRef<"UsernameBlocklist", 'DateTime'>
    readonly updatedAt: FieldRef<"UsernameBlocklist", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UsernameBlocklist findUnique
   */
  export type UsernameBlocklistFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * Filter, which UsernameBlocklist to fetch.
     */
    where: UsernameBlocklistWhereUniqueInput
  }

  /**
   * UsernameBlocklist findUniqueOrThrow
   */
  export type UsernameBlocklistFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * Filter, which UsernameBlocklist to fetch.
     */
    where: UsernameBlocklistWhereUniqueInput
  }

  /**
   * UsernameBlocklist findFirst
   */
  export type UsernameBlocklistFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * Filter, which UsernameBlocklist to fetch.
     */
    where?: UsernameBlocklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsernameBlocklists to fetch.
     */
    orderBy?: UsernameBlocklistOrderByWithRelationInput | UsernameBlocklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsernameBlocklists.
     */
    cursor?: UsernameBlocklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsernameBlocklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsernameBlocklists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsernameBlocklists.
     */
    distinct?: UsernameBlocklistScalarFieldEnum | UsernameBlocklistScalarFieldEnum[]
  }

  /**
   * UsernameBlocklist findFirstOrThrow
   */
  export type UsernameBlocklistFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * Filter, which UsernameBlocklist to fetch.
     */
    where?: UsernameBlocklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsernameBlocklists to fetch.
     */
    orderBy?: UsernameBlocklistOrderByWithRelationInput | UsernameBlocklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsernameBlocklists.
     */
    cursor?: UsernameBlocklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsernameBlocklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsernameBlocklists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsernameBlocklists.
     */
    distinct?: UsernameBlocklistScalarFieldEnum | UsernameBlocklistScalarFieldEnum[]
  }

  /**
   * UsernameBlocklist findMany
   */
  export type UsernameBlocklistFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * Filter, which UsernameBlocklists to fetch.
     */
    where?: UsernameBlocklistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsernameBlocklists to fetch.
     */
    orderBy?: UsernameBlocklistOrderByWithRelationInput | UsernameBlocklistOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UsernameBlocklists.
     */
    cursor?: UsernameBlocklistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsernameBlocklists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsernameBlocklists.
     */
    skip?: number
    distinct?: UsernameBlocklistScalarFieldEnum | UsernameBlocklistScalarFieldEnum[]
  }

  /**
   * UsernameBlocklist create
   */
  export type UsernameBlocklistCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * The data needed to create a UsernameBlocklist.
     */
    data: XOR<UsernameBlocklistCreateInput, UsernameBlocklistUncheckedCreateInput>
  }

  /**
   * UsernameBlocklist createMany
   */
  export type UsernameBlocklistCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UsernameBlocklists.
     */
    data: UsernameBlocklistCreateManyInput | UsernameBlocklistCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UsernameBlocklist createManyAndReturn
   */
  export type UsernameBlocklistCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * The data used to create many UsernameBlocklists.
     */
    data: UsernameBlocklistCreateManyInput | UsernameBlocklistCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UsernameBlocklist update
   */
  export type UsernameBlocklistUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * The data needed to update a UsernameBlocklist.
     */
    data: XOR<UsernameBlocklistUpdateInput, UsernameBlocklistUncheckedUpdateInput>
    /**
     * Choose, which UsernameBlocklist to update.
     */
    where: UsernameBlocklistWhereUniqueInput
  }

  /**
   * UsernameBlocklist updateMany
   */
  export type UsernameBlocklistUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UsernameBlocklists.
     */
    data: XOR<UsernameBlocklistUpdateManyMutationInput, UsernameBlocklistUncheckedUpdateManyInput>
    /**
     * Filter which UsernameBlocklists to update
     */
    where?: UsernameBlocklistWhereInput
    /**
     * Limit how many UsernameBlocklists to update.
     */
    limit?: number
  }

  /**
   * UsernameBlocklist updateManyAndReturn
   */
  export type UsernameBlocklistUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * The data used to update UsernameBlocklists.
     */
    data: XOR<UsernameBlocklistUpdateManyMutationInput, UsernameBlocklistUncheckedUpdateManyInput>
    /**
     * Filter which UsernameBlocklists to update
     */
    where?: UsernameBlocklistWhereInput
    /**
     * Limit how many UsernameBlocklists to update.
     */
    limit?: number
  }

  /**
   * UsernameBlocklist upsert
   */
  export type UsernameBlocklistUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * The filter to search for the UsernameBlocklist to update in case it exists.
     */
    where: UsernameBlocklistWhereUniqueInput
    /**
     * In case the UsernameBlocklist found by the `where` argument doesn't exist, create a new UsernameBlocklist with this data.
     */
    create: XOR<UsernameBlocklistCreateInput, UsernameBlocklistUncheckedCreateInput>
    /**
     * In case the UsernameBlocklist was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsernameBlocklistUpdateInput, UsernameBlocklistUncheckedUpdateInput>
  }

  /**
   * UsernameBlocklist delete
   */
  export type UsernameBlocklistDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
    /**
     * Filter which UsernameBlocklist to delete.
     */
    where: UsernameBlocklistWhereUniqueInput
  }

  /**
   * UsernameBlocklist deleteMany
   */
  export type UsernameBlocklistDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsernameBlocklists to delete
     */
    where?: UsernameBlocklistWhereInput
    /**
     * Limit how many UsernameBlocklists to delete.
     */
    limit?: number
  }

  /**
   * UsernameBlocklist without action
   */
  export type UsernameBlocklistDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsernameBlocklist
     */
    select?: UsernameBlocklistSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsernameBlocklist
     */
    omit?: UsernameBlocklistOmit<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountAvgAggregateOutputType = {
    expires_at: number | null
    refresh_token_expires_in: number | null
  }

  export type AccountSumAggregateOutputType = {
    expires_at: number | null
    refresh_token_expires_in: number | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    refresh_token_expires_in: number | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    refresh_token_expires_in: number | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    provider: number
    providerAccountId: number
    refresh_token: number
    access_token: number
    expires_at: number
    token_type: number
    scope: number
    id_token: number
    session_state: number
    refresh_token_expires_in: number
    _all: number
  }


  export type AccountAvgAggregateInputType = {
    expires_at?: true
    refresh_token_expires_in?: true
  }

  export type AccountSumAggregateInputType = {
    expires_at?: true
    refresh_token_expires_in?: true
  }

  export type AccountMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    refresh_token_expires_in?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    refresh_token_expires_in?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    refresh_token_expires_in?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _avg?: AccountAvgAggregateInputType
    _sum?: AccountSumAggregateInputType
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    refresh_token_expires_in: number | null
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    refresh_token_expires_in?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    refresh_token_expires_in?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    refresh_token_expires_in?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    refresh_token_expires_in?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "provider" | "providerAccountId" | "refresh_token" | "access_token" | "expires_at" | "token_type" | "scope" | "id_token" | "session_state" | "refresh_token_expires_in", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: string
      provider: string
      providerAccountId: string
      refresh_token: string | null
      access_token: string | null
      expires_at: number | null
      token_type: string | null
      scope: string | null
      id_token: string | null
      session_state: string | null
      refresh_token_expires_in: number | null
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly userId: FieldRef<"Account", 'String'>
    readonly type: FieldRef<"Account", 'String'>
    readonly provider: FieldRef<"Account", 'String'>
    readonly providerAccountId: FieldRef<"Account", 'String'>
    readonly refresh_token: FieldRef<"Account", 'String'>
    readonly access_token: FieldRef<"Account", 'String'>
    readonly expires_at: FieldRef<"Account", 'Int'>
    readonly token_type: FieldRef<"Account", 'String'>
    readonly scope: FieldRef<"Account", 'String'>
    readonly id_token: FieldRef<"Account", 'String'>
    readonly session_state: FieldRef<"Account", 'String'>
    readonly refresh_token_expires_in: FieldRef<"Account", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    sessionToken: number
    userId: number
    expires: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    sessionToken: string
    userId: string
    expires: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionToken" | "userId" | "expires", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionToken: string
      userId: string
      expires: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly sessionToken: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly expires: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model VerificationToken
   */

  export type AggregateVerificationToken = {
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  export type VerificationTokenMinAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenMaxAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenCountAggregateOutputType = {
    identifier: number
    token: number
    expires: number
    _all: number
  }


  export type VerificationTokenMinAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenMaxAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenCountAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
    _all?: true
  }

  export type VerificationTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationToken to aggregate.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VerificationTokens
    **/
    _count?: true | VerificationTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type GetVerificationTokenAggregateType<T extends VerificationTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateVerificationToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerificationToken[P]>
      : GetScalarType<T[P], AggregateVerificationToken[P]>
  }




  export type VerificationTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationTokenWhereInput
    orderBy?: VerificationTokenOrderByWithAggregationInput | VerificationTokenOrderByWithAggregationInput[]
    by: VerificationTokenScalarFieldEnum[] | VerificationTokenScalarFieldEnum
    having?: VerificationTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationTokenCountAggregateInputType | true
    _min?: VerificationTokenMinAggregateInputType
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type VerificationTokenGroupByOutputType = {
    identifier: string
    token: string
    expires: Date
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  type GetVerificationTokenGroupByPayload<T extends VerificationTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
        }
      >
    >


  export type VerificationTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectScalar = {
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }

  export type VerificationTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"identifier" | "token" | "expires", ExtArgs["result"]["verificationToken"]>

  export type $VerificationTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VerificationToken"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      identifier: string
      token: string
      expires: Date
    }, ExtArgs["result"]["verificationToken"]>
    composites: {}
  }

  type VerificationTokenGetPayload<S extends boolean | null | undefined | VerificationTokenDefaultArgs> = $Result.GetResult<Prisma.$VerificationTokenPayload, S>

  type VerificationTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationTokenCountAggregateInputType | true
    }

  export interface VerificationTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VerificationToken'], meta: { name: 'VerificationToken' } }
    /**
     * Find zero or one VerificationToken that matches the filter.
     * @param {VerificationTokenFindUniqueArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationTokenFindUniqueArgs>(args: SelectSubset<T, VerificationTokenFindUniqueArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VerificationToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationTokenFindUniqueOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationTokenFindFirstArgs>(args?: SelectSubset<T, VerificationTokenFindFirstArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VerificationTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany()
     * 
     * // Get first 10 VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany({ take: 10 })
     * 
     * // Only select the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.findMany({ select: { identifier: true } })
     * 
     */
    findMany<T extends VerificationTokenFindManyArgs>(args?: SelectSubset<T, VerificationTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VerificationToken.
     * @param {VerificationTokenCreateArgs} args - Arguments to create a VerificationToken.
     * @example
     * // Create one VerificationToken
     * const VerificationToken = await prisma.verificationToken.create({
     *   data: {
     *     // ... data to create a VerificationToken
     *   }
     * })
     * 
     */
    create<T extends VerificationTokenCreateArgs>(args: SelectSubset<T, VerificationTokenCreateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VerificationTokens.
     * @param {VerificationTokenCreateManyArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationTokenCreateManyArgs>(args?: SelectSubset<T, VerificationTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VerificationTokens and returns the data saved in the database.
     * @param {VerificationTokenCreateManyAndReturnArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.createManyAndReturn({
     *   select: { identifier: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VerificationToken.
     * @param {VerificationTokenDeleteArgs} args - Arguments to delete one VerificationToken.
     * @example
     * // Delete one VerificationToken
     * const VerificationToken = await prisma.verificationToken.delete({
     *   where: {
     *     // ... filter to delete one VerificationToken
     *   }
     * })
     * 
     */
    delete<T extends VerificationTokenDeleteArgs>(args: SelectSubset<T, VerificationTokenDeleteArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VerificationToken.
     * @param {VerificationTokenUpdateArgs} args - Arguments to update one VerificationToken.
     * @example
     * // Update one VerificationToken
     * const verificationToken = await prisma.verificationToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationTokenUpdateArgs>(args: SelectSubset<T, VerificationTokenUpdateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VerificationTokens.
     * @param {VerificationTokenDeleteManyArgs} args - Arguments to filter VerificationTokens to delete.
     * @example
     * // Delete a few VerificationTokens
     * const { count } = await prisma.verificationToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationTokenDeleteManyArgs>(args?: SelectSubset<T, VerificationTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationTokenUpdateManyArgs>(args: SelectSubset<T, VerificationTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens and returns the data updated in the database.
     * @param {VerificationTokenUpdateManyAndReturnArgs} args - Arguments to update many VerificationTokens.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.updateManyAndReturn({
     *   select: { identifier: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerificationTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VerificationToken.
     * @param {VerificationTokenUpsertArgs} args - Arguments to update or create a VerificationToken.
     * @example
     * // Update or create a VerificationToken
     * const verificationToken = await prisma.verificationToken.upsert({
     *   create: {
     *     // ... data to create a VerificationToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationToken we want to update
     *   }
     * })
     */
    upsert<T extends VerificationTokenUpsertArgs>(args: SelectSubset<T, VerificationTokenUpsertArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenCountArgs} args - Arguments to filter VerificationTokens to count.
     * @example
     * // Count the number of VerificationTokens
     * const count = await prisma.verificationToken.count({
     *   where: {
     *     // ... the filter for the VerificationTokens we want to count
     *   }
     * })
    **/
    count<T extends VerificationTokenCountArgs>(
      args?: Subset<T, VerificationTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerificationTokenAggregateArgs>(args: Subset<T, VerificationTokenAggregateArgs>): Prisma.PrismaPromise<GetVerificationTokenAggregateType<T>>

    /**
     * Group by VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerificationTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationTokenGroupByArgs['orderBy'] }
        : { orderBy?: VerificationTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VerificationToken model
   */
  readonly fields: VerificationTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VerificationToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VerificationToken model
   */
  interface VerificationTokenFieldRefs {
    readonly identifier: FieldRef<"VerificationToken", 'String'>
    readonly token: FieldRef<"VerificationToken", 'String'>
    readonly expires: FieldRef<"VerificationToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VerificationToken findUnique
   */
  export type VerificationTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findUniqueOrThrow
   */
  export type VerificationTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findFirst
   */
  export type VerificationTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findFirstOrThrow
   */
  export type VerificationTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findMany
   */
  export type VerificationTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationTokens to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken create
   */
  export type VerificationTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to create a VerificationToken.
     */
    data: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
  }

  /**
   * VerificationToken createMany
   */
  export type VerificationTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationToken createManyAndReturn
   */
  export type VerificationTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VerificationToken update
   */
  export type VerificationTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to update a VerificationToken.
     */
    data: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
    /**
     * Choose, which VerificationToken to update.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken updateMany
   */
  export type VerificationTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken updateManyAndReturn
   */
  export type VerificationTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken upsert
   */
  export type VerificationTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The filter to search for the VerificationToken to update in case it exists.
     */
    where: VerificationTokenWhereUniqueInput
    /**
     * In case the VerificationToken found by the `where` argument doesn't exist, create a new VerificationToken with this data.
     */
    create: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
    /**
     * In case the VerificationToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
  }

  /**
   * VerificationToken delete
   */
  export type VerificationTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter which VerificationToken to delete.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken deleteMany
   */
  export type VerificationTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationTokens to delete
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to delete.
     */
    limit?: number
  }

  /**
   * VerificationToken without action
   */
  export type VerificationTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    emailVerified: 'emailVerified',
    image: 'image',
    username: 'username',
    usernameNormalized: 'usernameNormalized',
    bio: 'bio',
    onboardedAt: 'onboardedAt',
    editorRevision: 'editorRevision',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ThemeScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    backgroundType: 'backgroundType',
    backgroundValue: 'backgroundValue',
    buttonStyle: 'buttonStyle',
    buttonShape: 'buttonShape',
    buttonColor: 'buttonColor',
    textColor: 'textColor',
    accentColor: 'accentColor',
    fontFamily: 'fontFamily',
    showBranding: 'showBranding',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ThemeScalarFieldEnum = (typeof ThemeScalarFieldEnum)[keyof typeof ThemeScalarFieldEnum]


  export const ProfileLinkScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    title: 'title',
    url: 'url',
    iconUrl: 'iconUrl',
    position: 'position',
    enabled: 'enabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProfileLinkScalarFieldEnum = (typeof ProfileLinkScalarFieldEnum)[keyof typeof ProfileLinkScalarFieldEnum]


  export const ClickEventScalarFieldEnum: {
    id: 'id',
    linkId: 'linkId',
    userId: 'userId',
    createdAt: 'createdAt',
    referrer: 'referrer',
    userAgent: 'userAgent',
    country: 'country',
    visitorHash: 'visitorHash'
  };

  export type ClickEventScalarFieldEnum = (typeof ClickEventScalarFieldEnum)[keyof typeof ClickEventScalarFieldEnum]


  export const AuthIntentScalarFieldEnum: {
    id: 'id',
    token: 'token',
    email: 'email',
    username: 'username',
    usernameNormalized: 'usernameNormalized',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type AuthIntentScalarFieldEnum = (typeof AuthIntentScalarFieldEnum)[keyof typeof AuthIntentScalarFieldEnum]


  export const UsernameBlocklistScalarFieldEnum: {
    id: 'id',
    termNormalized: 'termNormalized',
    enabled: 'enabled',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UsernameBlocklistScalarFieldEnum = (typeof UsernameBlocklistScalarFieldEnum)[keyof typeof UsernameBlocklistScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    provider: 'provider',
    providerAccountId: 'providerAccountId',
    refresh_token: 'refresh_token',
    access_token: 'access_token',
    expires_at: 'expires_at',
    token_type: 'token_type',
    scope: 'scope',
    id_token: 'id_token',
    session_state: 'session_state',
    refresh_token_expires_in: 'refresh_token_expires_in'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    sessionToken: 'sessionToken',
    userId: 'userId',
    expires: 'expires'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const VerificationTokenScalarFieldEnum: {
    identifier: 'identifier',
    token: 'token',
    expires: 'expires'
  };

  export type VerificationTokenScalarFieldEnum = (typeof VerificationTokenScalarFieldEnum)[keyof typeof VerificationTokenScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'BackgroundType'
   */
  export type EnumBackgroundTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BackgroundType'>
    


  /**
   * Reference to a field of type 'BackgroundType[]'
   */
  export type ListEnumBackgroundTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BackgroundType[]'>
    


  /**
   * Reference to a field of type 'ButtonStyle'
   */
  export type EnumButtonStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ButtonStyle'>
    


  /**
   * Reference to a field of type 'ButtonStyle[]'
   */
  export type ListEnumButtonStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ButtonStyle[]'>
    


  /**
   * Reference to a field of type 'ButtonShape'
   */
  export type EnumButtonShapeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ButtonShape'>
    


  /**
   * Reference to a field of type 'ButtonShape[]'
   */
  export type ListEnumButtonShapeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ButtonShape[]'>
    


  /**
   * Reference to a field of type 'FontFamily'
   */
  export type EnumFontFamilyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FontFamily'>
    


  /**
   * Reference to a field of type 'FontFamily[]'
   */
  export type ListEnumFontFamilyFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FontFamily[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    emailVerified?: DateTimeNullableFilter<"User"> | Date | string | null
    image?: StringNullableFilter<"User"> | string | null
    username?: StringNullableFilter<"User"> | string | null
    usernameNormalized?: StringNullableFilter<"User"> | string | null
    bio?: StringFilter<"User"> | string
    onboardedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    editorRevision?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
    theme?: XOR<ThemeNullableScalarRelationFilter, ThemeWhereInput> | null
    links?: ProfileLinkListRelationFilter
    clicks?: ClickEventListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    username?: SortOrderInput | SortOrder
    usernameNormalized?: SortOrderInput | SortOrder
    bio?: SortOrder
    onboardedAt?: SortOrderInput | SortOrder
    editorRevision?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    accounts?: AccountOrderByRelationAggregateInput
    sessions?: SessionOrderByRelationAggregateInput
    theme?: ThemeOrderByWithRelationInput
    links?: ProfileLinkOrderByRelationAggregateInput
    clicks?: ClickEventOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    username?: string
    usernameNormalized?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    emailVerified?: DateTimeNullableFilter<"User"> | Date | string | null
    image?: StringNullableFilter<"User"> | string | null
    bio?: StringFilter<"User"> | string
    onboardedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    editorRevision?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
    theme?: XOR<ThemeNullableScalarRelationFilter, ThemeWhereInput> | null
    links?: ProfileLinkListRelationFilter
    clicks?: ClickEventListRelationFilter
  }, "id" | "email" | "username" | "usernameNormalized">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    username?: SortOrderInput | SortOrder
    usernameNormalized?: SortOrderInput | SortOrder
    bio?: SortOrder
    onboardedAt?: SortOrderInput | SortOrder
    editorRevision?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    emailVerified?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    image?: StringNullableWithAggregatesFilter<"User"> | string | null
    username?: StringNullableWithAggregatesFilter<"User"> | string | null
    usernameNormalized?: StringNullableWithAggregatesFilter<"User"> | string | null
    bio?: StringWithAggregatesFilter<"User"> | string
    onboardedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    editorRevision?: IntWithAggregatesFilter<"User"> | number
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ThemeWhereInput = {
    AND?: ThemeWhereInput | ThemeWhereInput[]
    OR?: ThemeWhereInput[]
    NOT?: ThemeWhereInput | ThemeWhereInput[]
    id?: StringFilter<"Theme"> | string
    userId?: StringFilter<"Theme"> | string
    backgroundType?: EnumBackgroundTypeFilter<"Theme"> | $Enums.BackgroundType
    backgroundValue?: StringFilter<"Theme"> | string
    buttonStyle?: EnumButtonStyleFilter<"Theme"> | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFilter<"Theme"> | $Enums.ButtonShape
    buttonColor?: StringFilter<"Theme"> | string
    textColor?: StringFilter<"Theme"> | string
    accentColor?: StringFilter<"Theme"> | string
    fontFamily?: EnumFontFamilyFilter<"Theme"> | $Enums.FontFamily
    showBranding?: BoolFilter<"Theme"> | boolean
    createdAt?: DateTimeFilter<"Theme"> | Date | string
    updatedAt?: DateTimeFilter<"Theme"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ThemeOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    backgroundType?: SortOrder
    backgroundValue?: SortOrder
    buttonStyle?: SortOrder
    buttonShape?: SortOrder
    buttonColor?: SortOrder
    textColor?: SortOrder
    accentColor?: SortOrder
    fontFamily?: SortOrder
    showBranding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type ThemeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: ThemeWhereInput | ThemeWhereInput[]
    OR?: ThemeWhereInput[]
    NOT?: ThemeWhereInput | ThemeWhereInput[]
    backgroundType?: EnumBackgroundTypeFilter<"Theme"> | $Enums.BackgroundType
    backgroundValue?: StringFilter<"Theme"> | string
    buttonStyle?: EnumButtonStyleFilter<"Theme"> | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFilter<"Theme"> | $Enums.ButtonShape
    buttonColor?: StringFilter<"Theme"> | string
    textColor?: StringFilter<"Theme"> | string
    accentColor?: StringFilter<"Theme"> | string
    fontFamily?: EnumFontFamilyFilter<"Theme"> | $Enums.FontFamily
    showBranding?: BoolFilter<"Theme"> | boolean
    createdAt?: DateTimeFilter<"Theme"> | Date | string
    updatedAt?: DateTimeFilter<"Theme"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type ThemeOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    backgroundType?: SortOrder
    backgroundValue?: SortOrder
    buttonStyle?: SortOrder
    buttonShape?: SortOrder
    buttonColor?: SortOrder
    textColor?: SortOrder
    accentColor?: SortOrder
    fontFamily?: SortOrder
    showBranding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ThemeCountOrderByAggregateInput
    _max?: ThemeMaxOrderByAggregateInput
    _min?: ThemeMinOrderByAggregateInput
  }

  export type ThemeScalarWhereWithAggregatesInput = {
    AND?: ThemeScalarWhereWithAggregatesInput | ThemeScalarWhereWithAggregatesInput[]
    OR?: ThemeScalarWhereWithAggregatesInput[]
    NOT?: ThemeScalarWhereWithAggregatesInput | ThemeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Theme"> | string
    userId?: StringWithAggregatesFilter<"Theme"> | string
    backgroundType?: EnumBackgroundTypeWithAggregatesFilter<"Theme"> | $Enums.BackgroundType
    backgroundValue?: StringWithAggregatesFilter<"Theme"> | string
    buttonStyle?: EnumButtonStyleWithAggregatesFilter<"Theme"> | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeWithAggregatesFilter<"Theme"> | $Enums.ButtonShape
    buttonColor?: StringWithAggregatesFilter<"Theme"> | string
    textColor?: StringWithAggregatesFilter<"Theme"> | string
    accentColor?: StringWithAggregatesFilter<"Theme"> | string
    fontFamily?: EnumFontFamilyWithAggregatesFilter<"Theme"> | $Enums.FontFamily
    showBranding?: BoolWithAggregatesFilter<"Theme"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Theme"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Theme"> | Date | string
  }

  export type ProfileLinkWhereInput = {
    AND?: ProfileLinkWhereInput | ProfileLinkWhereInput[]
    OR?: ProfileLinkWhereInput[]
    NOT?: ProfileLinkWhereInput | ProfileLinkWhereInput[]
    id?: StringFilter<"ProfileLink"> | string
    userId?: StringFilter<"ProfileLink"> | string
    title?: StringFilter<"ProfileLink"> | string
    url?: StringFilter<"ProfileLink"> | string
    iconUrl?: StringNullableFilter<"ProfileLink"> | string | null
    position?: IntFilter<"ProfileLink"> | number
    enabled?: BoolFilter<"ProfileLink"> | boolean
    createdAt?: DateTimeFilter<"ProfileLink"> | Date | string
    updatedAt?: DateTimeFilter<"ProfileLink"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    clicks?: ClickEventListRelationFilter
  }

  export type ProfileLinkOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    url?: SortOrder
    iconUrl?: SortOrderInput | SortOrder
    position?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    clicks?: ClickEventOrderByRelationAggregateInput
  }

  export type ProfileLinkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    id_userId?: ProfileLinkIdUserIdCompoundUniqueInput
    AND?: ProfileLinkWhereInput | ProfileLinkWhereInput[]
    OR?: ProfileLinkWhereInput[]
    NOT?: ProfileLinkWhereInput | ProfileLinkWhereInput[]
    userId?: StringFilter<"ProfileLink"> | string
    title?: StringFilter<"ProfileLink"> | string
    url?: StringFilter<"ProfileLink"> | string
    iconUrl?: StringNullableFilter<"ProfileLink"> | string | null
    position?: IntFilter<"ProfileLink"> | number
    enabled?: BoolFilter<"ProfileLink"> | boolean
    createdAt?: DateTimeFilter<"ProfileLink"> | Date | string
    updatedAt?: DateTimeFilter<"ProfileLink"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    clicks?: ClickEventListRelationFilter
  }, "id" | "id_userId">

  export type ProfileLinkOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    url?: SortOrder
    iconUrl?: SortOrderInput | SortOrder
    position?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProfileLinkCountOrderByAggregateInput
    _avg?: ProfileLinkAvgOrderByAggregateInput
    _max?: ProfileLinkMaxOrderByAggregateInput
    _min?: ProfileLinkMinOrderByAggregateInput
    _sum?: ProfileLinkSumOrderByAggregateInput
  }

  export type ProfileLinkScalarWhereWithAggregatesInput = {
    AND?: ProfileLinkScalarWhereWithAggregatesInput | ProfileLinkScalarWhereWithAggregatesInput[]
    OR?: ProfileLinkScalarWhereWithAggregatesInput[]
    NOT?: ProfileLinkScalarWhereWithAggregatesInput | ProfileLinkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ProfileLink"> | string
    userId?: StringWithAggregatesFilter<"ProfileLink"> | string
    title?: StringWithAggregatesFilter<"ProfileLink"> | string
    url?: StringWithAggregatesFilter<"ProfileLink"> | string
    iconUrl?: StringNullableWithAggregatesFilter<"ProfileLink"> | string | null
    position?: IntWithAggregatesFilter<"ProfileLink"> | number
    enabled?: BoolWithAggregatesFilter<"ProfileLink"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ProfileLink"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ProfileLink"> | Date | string
  }

  export type ClickEventWhereInput = {
    AND?: ClickEventWhereInput | ClickEventWhereInput[]
    OR?: ClickEventWhereInput[]
    NOT?: ClickEventWhereInput | ClickEventWhereInput[]
    id?: StringFilter<"ClickEvent"> | string
    linkId?: StringFilter<"ClickEvent"> | string
    userId?: StringFilter<"ClickEvent"> | string
    createdAt?: DateTimeFilter<"ClickEvent"> | Date | string
    referrer?: StringNullableFilter<"ClickEvent"> | string | null
    userAgent?: StringNullableFilter<"ClickEvent"> | string | null
    country?: StringNullableFilter<"ClickEvent"> | string | null
    visitorHash?: StringNullableFilter<"ClickEvent"> | string | null
    link?: XOR<ProfileLinkScalarRelationFilter, ProfileLinkWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ClickEventOrderByWithRelationInput = {
    id?: SortOrder
    linkId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    referrer?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    visitorHash?: SortOrderInput | SortOrder
    link?: ProfileLinkOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type ClickEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClickEventWhereInput | ClickEventWhereInput[]
    OR?: ClickEventWhereInput[]
    NOT?: ClickEventWhereInput | ClickEventWhereInput[]
    linkId?: StringFilter<"ClickEvent"> | string
    userId?: StringFilter<"ClickEvent"> | string
    createdAt?: DateTimeFilter<"ClickEvent"> | Date | string
    referrer?: StringNullableFilter<"ClickEvent"> | string | null
    userAgent?: StringNullableFilter<"ClickEvent"> | string | null
    country?: StringNullableFilter<"ClickEvent"> | string | null
    visitorHash?: StringNullableFilter<"ClickEvent"> | string | null
    link?: XOR<ProfileLinkScalarRelationFilter, ProfileLinkWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type ClickEventOrderByWithAggregationInput = {
    id?: SortOrder
    linkId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    referrer?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    visitorHash?: SortOrderInput | SortOrder
    _count?: ClickEventCountOrderByAggregateInput
    _max?: ClickEventMaxOrderByAggregateInput
    _min?: ClickEventMinOrderByAggregateInput
  }

  export type ClickEventScalarWhereWithAggregatesInput = {
    AND?: ClickEventScalarWhereWithAggregatesInput | ClickEventScalarWhereWithAggregatesInput[]
    OR?: ClickEventScalarWhereWithAggregatesInput[]
    NOT?: ClickEventScalarWhereWithAggregatesInput | ClickEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClickEvent"> | string
    linkId?: StringWithAggregatesFilter<"ClickEvent"> | string
    userId?: StringWithAggregatesFilter<"ClickEvent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ClickEvent"> | Date | string
    referrer?: StringNullableWithAggregatesFilter<"ClickEvent"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"ClickEvent"> | string | null
    country?: StringNullableWithAggregatesFilter<"ClickEvent"> | string | null
    visitorHash?: StringNullableWithAggregatesFilter<"ClickEvent"> | string | null
  }

  export type AuthIntentWhereInput = {
    AND?: AuthIntentWhereInput | AuthIntentWhereInput[]
    OR?: AuthIntentWhereInput[]
    NOT?: AuthIntentWhereInput | AuthIntentWhereInput[]
    id?: StringFilter<"AuthIntent"> | string
    token?: StringFilter<"AuthIntent"> | string
    email?: StringFilter<"AuthIntent"> | string
    username?: StringFilter<"AuthIntent"> | string
    usernameNormalized?: StringFilter<"AuthIntent"> | string
    expiresAt?: DateTimeFilter<"AuthIntent"> | Date | string
    createdAt?: DateTimeFilter<"AuthIntent"> | Date | string
  }

  export type AuthIntentOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrder
    email?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AuthIntentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    email?: string
    usernameNormalized?: string
    AND?: AuthIntentWhereInput | AuthIntentWhereInput[]
    OR?: AuthIntentWhereInput[]
    NOT?: AuthIntentWhereInput | AuthIntentWhereInput[]
    username?: StringFilter<"AuthIntent"> | string
    expiresAt?: DateTimeFilter<"AuthIntent"> | Date | string
    createdAt?: DateTimeFilter<"AuthIntent"> | Date | string
  }, "id" | "token" | "email" | "usernameNormalized">

  export type AuthIntentOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrder
    email?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: AuthIntentCountOrderByAggregateInput
    _max?: AuthIntentMaxOrderByAggregateInput
    _min?: AuthIntentMinOrderByAggregateInput
  }

  export type AuthIntentScalarWhereWithAggregatesInput = {
    AND?: AuthIntentScalarWhereWithAggregatesInput | AuthIntentScalarWhereWithAggregatesInput[]
    OR?: AuthIntentScalarWhereWithAggregatesInput[]
    NOT?: AuthIntentScalarWhereWithAggregatesInput | AuthIntentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuthIntent"> | string
    token?: StringWithAggregatesFilter<"AuthIntent"> | string
    email?: StringWithAggregatesFilter<"AuthIntent"> | string
    username?: StringWithAggregatesFilter<"AuthIntent"> | string
    usernameNormalized?: StringWithAggregatesFilter<"AuthIntent"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"AuthIntent"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"AuthIntent"> | Date | string
  }

  export type UsernameBlocklistWhereInput = {
    AND?: UsernameBlocklistWhereInput | UsernameBlocklistWhereInput[]
    OR?: UsernameBlocklistWhereInput[]
    NOT?: UsernameBlocklistWhereInput | UsernameBlocklistWhereInput[]
    id?: StringFilter<"UsernameBlocklist"> | string
    termNormalized?: StringFilter<"UsernameBlocklist"> | string
    enabled?: BoolFilter<"UsernameBlocklist"> | boolean
    note?: StringNullableFilter<"UsernameBlocklist"> | string | null
    createdAt?: DateTimeFilter<"UsernameBlocklist"> | Date | string
    updatedAt?: DateTimeFilter<"UsernameBlocklist"> | Date | string
  }

  export type UsernameBlocklistOrderByWithRelationInput = {
    id?: SortOrder
    termNormalized?: SortOrder
    enabled?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsernameBlocklistWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    termNormalized?: string
    AND?: UsernameBlocklistWhereInput | UsernameBlocklistWhereInput[]
    OR?: UsernameBlocklistWhereInput[]
    NOT?: UsernameBlocklistWhereInput | UsernameBlocklistWhereInput[]
    enabled?: BoolFilter<"UsernameBlocklist"> | boolean
    note?: StringNullableFilter<"UsernameBlocklist"> | string | null
    createdAt?: DateTimeFilter<"UsernameBlocklist"> | Date | string
    updatedAt?: DateTimeFilter<"UsernameBlocklist"> | Date | string
  }, "id" | "termNormalized">

  export type UsernameBlocklistOrderByWithAggregationInput = {
    id?: SortOrder
    termNormalized?: SortOrder
    enabled?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UsernameBlocklistCountOrderByAggregateInput
    _max?: UsernameBlocklistMaxOrderByAggregateInput
    _min?: UsernameBlocklistMinOrderByAggregateInput
  }

  export type UsernameBlocklistScalarWhereWithAggregatesInput = {
    AND?: UsernameBlocklistScalarWhereWithAggregatesInput | UsernameBlocklistScalarWhereWithAggregatesInput[]
    OR?: UsernameBlocklistScalarWhereWithAggregatesInput[]
    NOT?: UsernameBlocklistScalarWhereWithAggregatesInput | UsernameBlocklistScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UsernameBlocklist"> | string
    termNormalized?: StringWithAggregatesFilter<"UsernameBlocklist"> | string
    enabled?: BoolWithAggregatesFilter<"UsernameBlocklist"> | boolean
    note?: StringNullableWithAggregatesFilter<"UsernameBlocklist"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UsernameBlocklist"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UsernameBlocklist"> | Date | string
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    refresh_token_expires_in?: IntNullableFilter<"Account"> | number | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    refresh_token_expires_in?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    provider_providerAccountId?: AccountProviderProviderAccountIdCompoundUniqueInput
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    refresh_token_expires_in?: IntNullableFilter<"Account"> | number | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "provider_providerAccountId">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    refresh_token_expires_in?: SortOrderInput | SortOrder
    _count?: AccountCountOrderByAggregateInput
    _avg?: AccountAvgOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
    _sum?: AccountSumOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    userId?: StringWithAggregatesFilter<"Account"> | string
    type?: StringWithAggregatesFilter<"Account"> | string
    provider?: StringWithAggregatesFilter<"Account"> | string
    providerAccountId?: StringWithAggregatesFilter<"Account"> | string
    refresh_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    access_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    expires_at?: IntNullableWithAggregatesFilter<"Account"> | number | null
    token_type?: StringNullableWithAggregatesFilter<"Account"> | string | null
    scope?: StringNullableWithAggregatesFilter<"Account"> | string | null
    id_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    session_state?: StringNullableWithAggregatesFilter<"Account"> | string | null
    refresh_token_expires_in?: IntNullableWithAggregatesFilter<"Account"> | number | null
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionToken?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "sessionToken">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    sessionToken?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    expires?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type VerificationTokenWhereInput = {
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    token?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }

  export type VerificationTokenOrderByWithRelationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenWhereUniqueInput = Prisma.AtLeast<{
    token?: string
    identifier_token?: VerificationTokenIdentifierTokenCompoundUniqueInput
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }, "token" | "identifier_token">

  export type VerificationTokenOrderByWithAggregationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
    _count?: VerificationTokenCountOrderByAggregateInput
    _max?: VerificationTokenMaxOrderByAggregateInput
    _min?: VerificationTokenMinOrderByAggregateInput
  }

  export type VerificationTokenScalarWhereWithAggregatesInput = {
    AND?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    OR?: VerificationTokenScalarWhereWithAggregatesInput[]
    NOT?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    identifier?: StringWithAggregatesFilter<"VerificationToken"> | string
    token?: StringWithAggregatesFilter<"VerificationToken"> | string
    expires?: DateTimeWithAggregatesFilter<"VerificationToken"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    theme?: ThemeCreateNestedOneWithoutUserInput
    links?: ProfileLinkCreateNestedManyWithoutUserInput
    clicks?: ClickEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    theme?: ThemeUncheckedCreateNestedOneWithoutUserInput
    links?: ProfileLinkUncheckedCreateNestedManyWithoutUserInput
    clicks?: ClickEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    theme?: ThemeUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    theme?: ThemeUncheckedUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUncheckedUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThemeCreateInput = {
    id?: string
    backgroundType?: $Enums.BackgroundType
    backgroundValue?: string
    buttonStyle?: $Enums.ButtonStyle
    buttonShape?: $Enums.ButtonShape
    buttonColor?: string
    textColor?: string
    accentColor?: string
    fontFamily?: $Enums.FontFamily
    showBranding?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutThemeInput
  }

  export type ThemeUncheckedCreateInput = {
    id?: string
    userId: string
    backgroundType?: $Enums.BackgroundType
    backgroundValue?: string
    buttonStyle?: $Enums.ButtonStyle
    buttonShape?: $Enums.ButtonShape
    buttonColor?: string
    textColor?: string
    accentColor?: string
    fontFamily?: $Enums.FontFamily
    showBranding?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ThemeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    backgroundType?: EnumBackgroundTypeFieldUpdateOperationsInput | $Enums.BackgroundType
    backgroundValue?: StringFieldUpdateOperationsInput | string
    buttonStyle?: EnumButtonStyleFieldUpdateOperationsInput | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFieldUpdateOperationsInput | $Enums.ButtonShape
    buttonColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    fontFamily?: EnumFontFamilyFieldUpdateOperationsInput | $Enums.FontFamily
    showBranding?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutThemeNestedInput
  }

  export type ThemeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    backgroundType?: EnumBackgroundTypeFieldUpdateOperationsInput | $Enums.BackgroundType
    backgroundValue?: StringFieldUpdateOperationsInput | string
    buttonStyle?: EnumButtonStyleFieldUpdateOperationsInput | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFieldUpdateOperationsInput | $Enums.ButtonShape
    buttonColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    fontFamily?: EnumFontFamilyFieldUpdateOperationsInput | $Enums.FontFamily
    showBranding?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThemeCreateManyInput = {
    id?: string
    userId: string
    backgroundType?: $Enums.BackgroundType
    backgroundValue?: string
    buttonStyle?: $Enums.ButtonStyle
    buttonShape?: $Enums.ButtonShape
    buttonColor?: string
    textColor?: string
    accentColor?: string
    fontFamily?: $Enums.FontFamily
    showBranding?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ThemeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    backgroundType?: EnumBackgroundTypeFieldUpdateOperationsInput | $Enums.BackgroundType
    backgroundValue?: StringFieldUpdateOperationsInput | string
    buttonStyle?: EnumButtonStyleFieldUpdateOperationsInput | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFieldUpdateOperationsInput | $Enums.ButtonShape
    buttonColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    fontFamily?: EnumFontFamilyFieldUpdateOperationsInput | $Enums.FontFamily
    showBranding?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThemeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    backgroundType?: EnumBackgroundTypeFieldUpdateOperationsInput | $Enums.BackgroundType
    backgroundValue?: StringFieldUpdateOperationsInput | string
    buttonStyle?: EnumButtonStyleFieldUpdateOperationsInput | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFieldUpdateOperationsInput | $Enums.ButtonShape
    buttonColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    fontFamily?: EnumFontFamilyFieldUpdateOperationsInput | $Enums.FontFamily
    showBranding?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileLinkCreateInput = {
    id: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutLinksInput
    clicks?: ClickEventCreateNestedManyWithoutLinkInput
  }

  export type ProfileLinkUncheckedCreateInput = {
    id: string
    userId: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    clicks?: ClickEventUncheckedCreateNestedManyWithoutLinkInput
  }

  export type ProfileLinkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLinksNestedInput
    clicks?: ClickEventUpdateManyWithoutLinkNestedInput
  }

  export type ProfileLinkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clicks?: ClickEventUncheckedUpdateManyWithoutLinkNestedInput
  }

  export type ProfileLinkCreateManyInput = {
    id: string
    userId: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProfileLinkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileLinkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClickEventCreateInput = {
    id?: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
    link: ProfileLinkCreateNestedOneWithoutClicksInput
    user: UserCreateNestedOneWithoutClicksInput
  }

  export type ClickEventUncheckedCreateInput = {
    id?: string
    linkId: string
    userId: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
  }

  export type ClickEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
    link?: ProfileLinkUpdateOneRequiredWithoutClicksNestedInput
    user?: UserUpdateOneRequiredWithoutClicksNestedInput
  }

  export type ClickEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    linkId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClickEventCreateManyInput = {
    id?: string
    linkId: string
    userId: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
  }

  export type ClickEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClickEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    linkId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuthIntentCreateInput = {
    id?: string
    token: string
    email: string
    username: string
    usernameNormalized: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AuthIntentUncheckedCreateInput = {
    id?: string
    token: string
    email: string
    username: string
    usernameNormalized: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AuthIntentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    usernameNormalized?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthIntentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    usernameNormalized?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthIntentCreateManyInput = {
    id?: string
    token: string
    email: string
    username: string
    usernameNormalized: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type AuthIntentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    usernameNormalized?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthIntentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    usernameNormalized?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsernameBlocklistCreateInput = {
    id?: string
    termNormalized: string
    enabled?: boolean
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsernameBlocklistUncheckedCreateInput = {
    id?: string
    termNormalized: string
    enabled?: boolean
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsernameBlocklistUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    termNormalized?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsernameBlocklistUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    termNormalized?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsernameBlocklistCreateManyInput = {
    id?: string
    termNormalized: string
    enabled?: boolean
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsernameBlocklistUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    termNormalized?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsernameBlocklistUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    termNormalized?: StringFieldUpdateOperationsInput | string
    enabled?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountCreateInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    refresh_token_expires_in?: number | null
    user: UserCreateNestedOneWithoutAccountsInput
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    refresh_token_expires_in?: number | null
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
    user?: UserUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type AccountCreateManyInput = {
    id?: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    refresh_token_expires_in?: number | null
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SessionCreateInput = {
    id?: string
    sessionToken: string
    expires: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUncheckedCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenCreateManyInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateManyMutationInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateManyInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AccountListRelationFilter = {
    every?: AccountWhereInput
    some?: AccountWhereInput
    none?: AccountWhereInput
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type ThemeNullableScalarRelationFilter = {
    is?: ThemeWhereInput | null
    isNot?: ThemeWhereInput | null
  }

  export type ProfileLinkListRelationFilter = {
    every?: ProfileLinkWhereInput
    some?: ProfileLinkWhereInput
    none?: ProfileLinkWhereInput
  }

  export type ClickEventListRelationFilter = {
    every?: ClickEventWhereInput
    some?: ClickEventWhereInput
    none?: ClickEventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProfileLinkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClickEventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    bio?: SortOrder
    onboardedAt?: SortOrder
    editorRevision?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    editorRevision?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    bio?: SortOrder
    onboardedAt?: SortOrder
    editorRevision?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    bio?: SortOrder
    onboardedAt?: SortOrder
    editorRevision?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    editorRevision?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumBackgroundTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.BackgroundType | EnumBackgroundTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBackgroundTypeFilter<$PrismaModel> | $Enums.BackgroundType
  }

  export type EnumButtonStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonStyle | EnumButtonStyleFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonStyleFilter<$PrismaModel> | $Enums.ButtonStyle
  }

  export type EnumButtonShapeFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonShape | EnumButtonShapeFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonShapeFilter<$PrismaModel> | $Enums.ButtonShape
  }

  export type EnumFontFamilyFilter<$PrismaModel = never> = {
    equals?: $Enums.FontFamily | EnumFontFamilyFieldRefInput<$PrismaModel>
    in?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    notIn?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    not?: NestedEnumFontFamilyFilter<$PrismaModel> | $Enums.FontFamily
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ThemeCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    backgroundType?: SortOrder
    backgroundValue?: SortOrder
    buttonStyle?: SortOrder
    buttonShape?: SortOrder
    buttonColor?: SortOrder
    textColor?: SortOrder
    accentColor?: SortOrder
    fontFamily?: SortOrder
    showBranding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ThemeMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    backgroundType?: SortOrder
    backgroundValue?: SortOrder
    buttonStyle?: SortOrder
    buttonShape?: SortOrder
    buttonColor?: SortOrder
    textColor?: SortOrder
    accentColor?: SortOrder
    fontFamily?: SortOrder
    showBranding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ThemeMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    backgroundType?: SortOrder
    backgroundValue?: SortOrder
    buttonStyle?: SortOrder
    buttonShape?: SortOrder
    buttonColor?: SortOrder
    textColor?: SortOrder
    accentColor?: SortOrder
    fontFamily?: SortOrder
    showBranding?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumBackgroundTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BackgroundType | EnumBackgroundTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBackgroundTypeWithAggregatesFilter<$PrismaModel> | $Enums.BackgroundType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBackgroundTypeFilter<$PrismaModel>
    _max?: NestedEnumBackgroundTypeFilter<$PrismaModel>
  }

  export type EnumButtonStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonStyle | EnumButtonStyleFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonStyleWithAggregatesFilter<$PrismaModel> | $Enums.ButtonStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumButtonStyleFilter<$PrismaModel>
    _max?: NestedEnumButtonStyleFilter<$PrismaModel>
  }

  export type EnumButtonShapeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonShape | EnumButtonShapeFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonShapeWithAggregatesFilter<$PrismaModel> | $Enums.ButtonShape
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumButtonShapeFilter<$PrismaModel>
    _max?: NestedEnumButtonShapeFilter<$PrismaModel>
  }

  export type EnumFontFamilyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FontFamily | EnumFontFamilyFieldRefInput<$PrismaModel>
    in?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    notIn?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    not?: NestedEnumFontFamilyWithAggregatesFilter<$PrismaModel> | $Enums.FontFamily
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFontFamilyFilter<$PrismaModel>
    _max?: NestedEnumFontFamilyFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProfileLinkIdUserIdCompoundUniqueInput = {
    id: string
    userId: string
  }

  export type ProfileLinkCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    url?: SortOrder
    iconUrl?: SortOrder
    position?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProfileLinkAvgOrderByAggregateInput = {
    position?: SortOrder
  }

  export type ProfileLinkMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    url?: SortOrder
    iconUrl?: SortOrder
    position?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProfileLinkMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    title?: SortOrder
    url?: SortOrder
    iconUrl?: SortOrder
    position?: SortOrder
    enabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProfileLinkSumOrderByAggregateInput = {
    position?: SortOrder
  }

  export type ProfileLinkScalarRelationFilter = {
    is?: ProfileLinkWhereInput
    isNot?: ProfileLinkWhereInput
  }

  export type ClickEventCountOrderByAggregateInput = {
    id?: SortOrder
    linkId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    referrer?: SortOrder
    userAgent?: SortOrder
    country?: SortOrder
    visitorHash?: SortOrder
  }

  export type ClickEventMaxOrderByAggregateInput = {
    id?: SortOrder
    linkId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    referrer?: SortOrder
    userAgent?: SortOrder
    country?: SortOrder
    visitorHash?: SortOrder
  }

  export type ClickEventMinOrderByAggregateInput = {
    id?: SortOrder
    linkId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    referrer?: SortOrder
    userAgent?: SortOrder
    country?: SortOrder
    visitorHash?: SortOrder
  }

  export type AuthIntentCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    email?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AuthIntentMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    email?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AuthIntentMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    email?: SortOrder
    username?: SortOrder
    usernameNormalized?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UsernameBlocklistCountOrderByAggregateInput = {
    id?: SortOrder
    termNormalized?: SortOrder
    enabled?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsernameBlocklistMaxOrderByAggregateInput = {
    id?: SortOrder
    termNormalized?: SortOrder
    enabled?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsernameBlocklistMinOrderByAggregateInput = {
    id?: SortOrder
    termNormalized?: SortOrder
    enabled?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type AccountProviderProviderAccountIdCompoundUniqueInput = {
    provider: string
    providerAccountId: string
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
    refresh_token_expires_in?: SortOrder
  }

  export type AccountAvgOrderByAggregateInput = {
    expires_at?: SortOrder
    refresh_token_expires_in?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
    refresh_token_expires_in?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
    refresh_token_expires_in?: SortOrder
  }

  export type AccountSumOrderByAggregateInput = {
    expires_at?: SortOrder
    refresh_token_expires_in?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenIdentifierTokenCompoundUniqueInput = {
    identifier: string
    token: string
  }

  export type VerificationTokenCountOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMaxOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMinOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type AccountCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type ThemeCreateNestedOneWithoutUserInput = {
    create?: XOR<ThemeCreateWithoutUserInput, ThemeUncheckedCreateWithoutUserInput>
    connectOrCreate?: ThemeCreateOrConnectWithoutUserInput
    connect?: ThemeWhereUniqueInput
  }

  export type ProfileLinkCreateNestedManyWithoutUserInput = {
    create?: XOR<ProfileLinkCreateWithoutUserInput, ProfileLinkUncheckedCreateWithoutUserInput> | ProfileLinkCreateWithoutUserInput[] | ProfileLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProfileLinkCreateOrConnectWithoutUserInput | ProfileLinkCreateOrConnectWithoutUserInput[]
    createMany?: ProfileLinkCreateManyUserInputEnvelope
    connect?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
  }

  export type ClickEventCreateNestedManyWithoutUserInput = {
    create?: XOR<ClickEventCreateWithoutUserInput, ClickEventUncheckedCreateWithoutUserInput> | ClickEventCreateWithoutUserInput[] | ClickEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutUserInput | ClickEventCreateOrConnectWithoutUserInput[]
    createMany?: ClickEventCreateManyUserInputEnvelope
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type ThemeUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<ThemeCreateWithoutUserInput, ThemeUncheckedCreateWithoutUserInput>
    connectOrCreate?: ThemeCreateOrConnectWithoutUserInput
    connect?: ThemeWhereUniqueInput
  }

  export type ProfileLinkUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ProfileLinkCreateWithoutUserInput, ProfileLinkUncheckedCreateWithoutUserInput> | ProfileLinkCreateWithoutUserInput[] | ProfileLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProfileLinkCreateOrConnectWithoutUserInput | ProfileLinkCreateOrConnectWithoutUserInput[]
    createMany?: ProfileLinkCreateManyUserInputEnvelope
    connect?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
  }

  export type ClickEventUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ClickEventCreateWithoutUserInput, ClickEventUncheckedCreateWithoutUserInput> | ClickEventCreateWithoutUserInput[] | ClickEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutUserInput | ClickEventCreateOrConnectWithoutUserInput[]
    createMany?: ClickEventCreateManyUserInputEnvelope
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type ThemeUpdateOneWithoutUserNestedInput = {
    create?: XOR<ThemeCreateWithoutUserInput, ThemeUncheckedCreateWithoutUserInput>
    connectOrCreate?: ThemeCreateOrConnectWithoutUserInput
    upsert?: ThemeUpsertWithoutUserInput
    disconnect?: ThemeWhereInput | boolean
    delete?: ThemeWhereInput | boolean
    connect?: ThemeWhereUniqueInput
    update?: XOR<XOR<ThemeUpdateToOneWithWhereWithoutUserInput, ThemeUpdateWithoutUserInput>, ThemeUncheckedUpdateWithoutUserInput>
  }

  export type ProfileLinkUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProfileLinkCreateWithoutUserInput, ProfileLinkUncheckedCreateWithoutUserInput> | ProfileLinkCreateWithoutUserInput[] | ProfileLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProfileLinkCreateOrConnectWithoutUserInput | ProfileLinkCreateOrConnectWithoutUserInput[]
    upsert?: ProfileLinkUpsertWithWhereUniqueWithoutUserInput | ProfileLinkUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProfileLinkCreateManyUserInputEnvelope
    set?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    disconnect?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    delete?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    connect?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    update?: ProfileLinkUpdateWithWhereUniqueWithoutUserInput | ProfileLinkUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProfileLinkUpdateManyWithWhereWithoutUserInput | ProfileLinkUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProfileLinkScalarWhereInput | ProfileLinkScalarWhereInput[]
  }

  export type ClickEventUpdateManyWithoutUserNestedInput = {
    create?: XOR<ClickEventCreateWithoutUserInput, ClickEventUncheckedCreateWithoutUserInput> | ClickEventCreateWithoutUserInput[] | ClickEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutUserInput | ClickEventCreateOrConnectWithoutUserInput[]
    upsert?: ClickEventUpsertWithWhereUniqueWithoutUserInput | ClickEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ClickEventCreateManyUserInputEnvelope
    set?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    disconnect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    delete?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    update?: ClickEventUpdateWithWhereUniqueWithoutUserInput | ClickEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ClickEventUpdateManyWithWhereWithoutUserInput | ClickEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ClickEventScalarWhereInput | ClickEventScalarWhereInput[]
  }

  export type AccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type ThemeUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<ThemeCreateWithoutUserInput, ThemeUncheckedCreateWithoutUserInput>
    connectOrCreate?: ThemeCreateOrConnectWithoutUserInput
    upsert?: ThemeUpsertWithoutUserInput
    disconnect?: ThemeWhereInput | boolean
    delete?: ThemeWhereInput | boolean
    connect?: ThemeWhereUniqueInput
    update?: XOR<XOR<ThemeUpdateToOneWithWhereWithoutUserInput, ThemeUpdateWithoutUserInput>, ThemeUncheckedUpdateWithoutUserInput>
  }

  export type ProfileLinkUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProfileLinkCreateWithoutUserInput, ProfileLinkUncheckedCreateWithoutUserInput> | ProfileLinkCreateWithoutUserInput[] | ProfileLinkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProfileLinkCreateOrConnectWithoutUserInput | ProfileLinkCreateOrConnectWithoutUserInput[]
    upsert?: ProfileLinkUpsertWithWhereUniqueWithoutUserInput | ProfileLinkUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProfileLinkCreateManyUserInputEnvelope
    set?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    disconnect?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    delete?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    connect?: ProfileLinkWhereUniqueInput | ProfileLinkWhereUniqueInput[]
    update?: ProfileLinkUpdateWithWhereUniqueWithoutUserInput | ProfileLinkUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProfileLinkUpdateManyWithWhereWithoutUserInput | ProfileLinkUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProfileLinkScalarWhereInput | ProfileLinkScalarWhereInput[]
  }

  export type ClickEventUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ClickEventCreateWithoutUserInput, ClickEventUncheckedCreateWithoutUserInput> | ClickEventCreateWithoutUserInput[] | ClickEventUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutUserInput | ClickEventCreateOrConnectWithoutUserInput[]
    upsert?: ClickEventUpsertWithWhereUniqueWithoutUserInput | ClickEventUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ClickEventCreateManyUserInputEnvelope
    set?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    disconnect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    delete?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    update?: ClickEventUpdateWithWhereUniqueWithoutUserInput | ClickEventUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ClickEventUpdateManyWithWhereWithoutUserInput | ClickEventUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ClickEventScalarWhereInput | ClickEventScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutThemeInput = {
    create?: XOR<UserCreateWithoutThemeInput, UserUncheckedCreateWithoutThemeInput>
    connectOrCreate?: UserCreateOrConnectWithoutThemeInput
    connect?: UserWhereUniqueInput
  }

  export type EnumBackgroundTypeFieldUpdateOperationsInput = {
    set?: $Enums.BackgroundType
  }

  export type EnumButtonStyleFieldUpdateOperationsInput = {
    set?: $Enums.ButtonStyle
  }

  export type EnumButtonShapeFieldUpdateOperationsInput = {
    set?: $Enums.ButtonShape
  }

  export type EnumFontFamilyFieldUpdateOperationsInput = {
    set?: $Enums.FontFamily
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutThemeNestedInput = {
    create?: XOR<UserCreateWithoutThemeInput, UserUncheckedCreateWithoutThemeInput>
    connectOrCreate?: UserCreateOrConnectWithoutThemeInput
    upsert?: UserUpsertWithoutThemeInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutThemeInput, UserUpdateWithoutThemeInput>, UserUncheckedUpdateWithoutThemeInput>
  }

  export type UserCreateNestedOneWithoutLinksInput = {
    create?: XOR<UserCreateWithoutLinksInput, UserUncheckedCreateWithoutLinksInput>
    connectOrCreate?: UserCreateOrConnectWithoutLinksInput
    connect?: UserWhereUniqueInput
  }

  export type ClickEventCreateNestedManyWithoutLinkInput = {
    create?: XOR<ClickEventCreateWithoutLinkInput, ClickEventUncheckedCreateWithoutLinkInput> | ClickEventCreateWithoutLinkInput[] | ClickEventUncheckedCreateWithoutLinkInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutLinkInput | ClickEventCreateOrConnectWithoutLinkInput[]
    createMany?: ClickEventCreateManyLinkInputEnvelope
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
  }

  export type ClickEventUncheckedCreateNestedManyWithoutLinkInput = {
    create?: XOR<ClickEventCreateWithoutLinkInput, ClickEventUncheckedCreateWithoutLinkInput> | ClickEventCreateWithoutLinkInput[] | ClickEventUncheckedCreateWithoutLinkInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutLinkInput | ClickEventCreateOrConnectWithoutLinkInput[]
    createMany?: ClickEventCreateManyLinkInputEnvelope
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutLinksNestedInput = {
    create?: XOR<UserCreateWithoutLinksInput, UserUncheckedCreateWithoutLinksInput>
    connectOrCreate?: UserCreateOrConnectWithoutLinksInput
    upsert?: UserUpsertWithoutLinksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLinksInput, UserUpdateWithoutLinksInput>, UserUncheckedUpdateWithoutLinksInput>
  }

  export type ClickEventUpdateManyWithoutLinkNestedInput = {
    create?: XOR<ClickEventCreateWithoutLinkInput, ClickEventUncheckedCreateWithoutLinkInput> | ClickEventCreateWithoutLinkInput[] | ClickEventUncheckedCreateWithoutLinkInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutLinkInput | ClickEventCreateOrConnectWithoutLinkInput[]
    upsert?: ClickEventUpsertWithWhereUniqueWithoutLinkInput | ClickEventUpsertWithWhereUniqueWithoutLinkInput[]
    createMany?: ClickEventCreateManyLinkInputEnvelope
    set?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    disconnect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    delete?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    update?: ClickEventUpdateWithWhereUniqueWithoutLinkInput | ClickEventUpdateWithWhereUniqueWithoutLinkInput[]
    updateMany?: ClickEventUpdateManyWithWhereWithoutLinkInput | ClickEventUpdateManyWithWhereWithoutLinkInput[]
    deleteMany?: ClickEventScalarWhereInput | ClickEventScalarWhereInput[]
  }

  export type ClickEventUncheckedUpdateManyWithoutLinkNestedInput = {
    create?: XOR<ClickEventCreateWithoutLinkInput, ClickEventUncheckedCreateWithoutLinkInput> | ClickEventCreateWithoutLinkInput[] | ClickEventUncheckedCreateWithoutLinkInput[]
    connectOrCreate?: ClickEventCreateOrConnectWithoutLinkInput | ClickEventCreateOrConnectWithoutLinkInput[]
    upsert?: ClickEventUpsertWithWhereUniqueWithoutLinkInput | ClickEventUpsertWithWhereUniqueWithoutLinkInput[]
    createMany?: ClickEventCreateManyLinkInputEnvelope
    set?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    disconnect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    delete?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    connect?: ClickEventWhereUniqueInput | ClickEventWhereUniqueInput[]
    update?: ClickEventUpdateWithWhereUniqueWithoutLinkInput | ClickEventUpdateWithWhereUniqueWithoutLinkInput[]
    updateMany?: ClickEventUpdateManyWithWhereWithoutLinkInput | ClickEventUpdateManyWithWhereWithoutLinkInput[]
    deleteMany?: ClickEventScalarWhereInput | ClickEventScalarWhereInput[]
  }

  export type ProfileLinkCreateNestedOneWithoutClicksInput = {
    create?: XOR<ProfileLinkCreateWithoutClicksInput, ProfileLinkUncheckedCreateWithoutClicksInput>
    connectOrCreate?: ProfileLinkCreateOrConnectWithoutClicksInput
    connect?: ProfileLinkWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutClicksInput = {
    create?: XOR<UserCreateWithoutClicksInput, UserUncheckedCreateWithoutClicksInput>
    connectOrCreate?: UserCreateOrConnectWithoutClicksInput
    connect?: UserWhereUniqueInput
  }

  export type ProfileLinkUpdateOneRequiredWithoutClicksNestedInput = {
    create?: XOR<ProfileLinkCreateWithoutClicksInput, ProfileLinkUncheckedCreateWithoutClicksInput>
    connectOrCreate?: ProfileLinkCreateOrConnectWithoutClicksInput
    upsert?: ProfileLinkUpsertWithoutClicksInput
    connect?: ProfileLinkWhereUniqueInput
    update?: XOR<XOR<ProfileLinkUpdateToOneWithWhereWithoutClicksInput, ProfileLinkUpdateWithoutClicksInput>, ProfileLinkUncheckedUpdateWithoutClicksInput>
  }

  export type UserUpdateOneRequiredWithoutClicksNestedInput = {
    create?: XOR<UserCreateWithoutClicksInput, UserUncheckedCreateWithoutClicksInput>
    connectOrCreate?: UserCreateOrConnectWithoutClicksInput
    upsert?: UserUpsertWithoutClicksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutClicksInput, UserUpdateWithoutClicksInput>, UserUncheckedUpdateWithoutClicksInput>
  }

  export type UserCreateNestedOneWithoutAccountsInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    upsert?: UserUpsertWithoutAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateWithoutAccountsInput>, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumBackgroundTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.BackgroundType | EnumBackgroundTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBackgroundTypeFilter<$PrismaModel> | $Enums.BackgroundType
  }

  export type NestedEnumButtonStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonStyle | EnumButtonStyleFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonStyleFilter<$PrismaModel> | $Enums.ButtonStyle
  }

  export type NestedEnumButtonShapeFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonShape | EnumButtonShapeFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonShapeFilter<$PrismaModel> | $Enums.ButtonShape
  }

  export type NestedEnumFontFamilyFilter<$PrismaModel = never> = {
    equals?: $Enums.FontFamily | EnumFontFamilyFieldRefInput<$PrismaModel>
    in?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    notIn?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    not?: NestedEnumFontFamilyFilter<$PrismaModel> | $Enums.FontFamily
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumBackgroundTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BackgroundType | EnumBackgroundTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BackgroundType[] | ListEnumBackgroundTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBackgroundTypeWithAggregatesFilter<$PrismaModel> | $Enums.BackgroundType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBackgroundTypeFilter<$PrismaModel>
    _max?: NestedEnumBackgroundTypeFilter<$PrismaModel>
  }

  export type NestedEnumButtonStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonStyle | EnumButtonStyleFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonStyle[] | ListEnumButtonStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonStyleWithAggregatesFilter<$PrismaModel> | $Enums.ButtonStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumButtonStyleFilter<$PrismaModel>
    _max?: NestedEnumButtonStyleFilter<$PrismaModel>
  }

  export type NestedEnumButtonShapeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ButtonShape | EnumButtonShapeFieldRefInput<$PrismaModel>
    in?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ButtonShape[] | ListEnumButtonShapeFieldRefInput<$PrismaModel>
    not?: NestedEnumButtonShapeWithAggregatesFilter<$PrismaModel> | $Enums.ButtonShape
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumButtonShapeFilter<$PrismaModel>
    _max?: NestedEnumButtonShapeFilter<$PrismaModel>
  }

  export type NestedEnumFontFamilyWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FontFamily | EnumFontFamilyFieldRefInput<$PrismaModel>
    in?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    notIn?: $Enums.FontFamily[] | ListEnumFontFamilyFieldRefInput<$PrismaModel>
    not?: NestedEnumFontFamilyWithAggregatesFilter<$PrismaModel> | $Enums.FontFamily
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFontFamilyFilter<$PrismaModel>
    _max?: NestedEnumFontFamilyFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type AccountCreateWithoutUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    refresh_token_expires_in?: number | null
  }

  export type AccountUncheckedCreateWithoutUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    refresh_token_expires_in?: number | null
  }

  export type AccountCreateOrConnectWithoutUserInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountCreateManyUserInputEnvelope = {
    data: AccountCreateManyUserInput | AccountCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ThemeCreateWithoutUserInput = {
    id?: string
    backgroundType?: $Enums.BackgroundType
    backgroundValue?: string
    buttonStyle?: $Enums.ButtonStyle
    buttonShape?: $Enums.ButtonShape
    buttonColor?: string
    textColor?: string
    accentColor?: string
    fontFamily?: $Enums.FontFamily
    showBranding?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ThemeUncheckedCreateWithoutUserInput = {
    id?: string
    backgroundType?: $Enums.BackgroundType
    backgroundValue?: string
    buttonStyle?: $Enums.ButtonStyle
    buttonShape?: $Enums.ButtonShape
    buttonColor?: string
    textColor?: string
    accentColor?: string
    fontFamily?: $Enums.FontFamily
    showBranding?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ThemeCreateOrConnectWithoutUserInput = {
    where: ThemeWhereUniqueInput
    create: XOR<ThemeCreateWithoutUserInput, ThemeUncheckedCreateWithoutUserInput>
  }

  export type ProfileLinkCreateWithoutUserInput = {
    id: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    clicks?: ClickEventCreateNestedManyWithoutLinkInput
  }

  export type ProfileLinkUncheckedCreateWithoutUserInput = {
    id: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    clicks?: ClickEventUncheckedCreateNestedManyWithoutLinkInput
  }

  export type ProfileLinkCreateOrConnectWithoutUserInput = {
    where: ProfileLinkWhereUniqueInput
    create: XOR<ProfileLinkCreateWithoutUserInput, ProfileLinkUncheckedCreateWithoutUserInput>
  }

  export type ProfileLinkCreateManyUserInputEnvelope = {
    data: ProfileLinkCreateManyUserInput | ProfileLinkCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ClickEventCreateWithoutUserInput = {
    id?: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
    link: ProfileLinkCreateNestedOneWithoutClicksInput
  }

  export type ClickEventUncheckedCreateWithoutUserInput = {
    id?: string
    linkId: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
  }

  export type ClickEventCreateOrConnectWithoutUserInput = {
    where: ClickEventWhereUniqueInput
    create: XOR<ClickEventCreateWithoutUserInput, ClickEventUncheckedCreateWithoutUserInput>
  }

  export type ClickEventCreateManyUserInputEnvelope = {
    data: ClickEventCreateManyUserInput | ClickEventCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AccountUpsertWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    update: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountUpdateWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    data: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
  }

  export type AccountUpdateManyWithWhereWithoutUserInput = {
    where: AccountScalarWhereInput
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutUserInput>
  }

  export type AccountScalarWhereInput = {
    AND?: AccountScalarWhereInput | AccountScalarWhereInput[]
    OR?: AccountScalarWhereInput[]
    NOT?: AccountScalarWhereInput | AccountScalarWhereInput[]
    id?: StringFilter<"Account"> | string
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    refresh_token_expires_in?: IntNullableFilter<"Account"> | number | null
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
  }

  export type ThemeUpsertWithoutUserInput = {
    update: XOR<ThemeUpdateWithoutUserInput, ThemeUncheckedUpdateWithoutUserInput>
    create: XOR<ThemeCreateWithoutUserInput, ThemeUncheckedCreateWithoutUserInput>
    where?: ThemeWhereInput
  }

  export type ThemeUpdateToOneWithWhereWithoutUserInput = {
    where?: ThemeWhereInput
    data: XOR<ThemeUpdateWithoutUserInput, ThemeUncheckedUpdateWithoutUserInput>
  }

  export type ThemeUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    backgroundType?: EnumBackgroundTypeFieldUpdateOperationsInput | $Enums.BackgroundType
    backgroundValue?: StringFieldUpdateOperationsInput | string
    buttonStyle?: EnumButtonStyleFieldUpdateOperationsInput | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFieldUpdateOperationsInput | $Enums.ButtonShape
    buttonColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    fontFamily?: EnumFontFamilyFieldUpdateOperationsInput | $Enums.FontFamily
    showBranding?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ThemeUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    backgroundType?: EnumBackgroundTypeFieldUpdateOperationsInput | $Enums.BackgroundType
    backgroundValue?: StringFieldUpdateOperationsInput | string
    buttonStyle?: EnumButtonStyleFieldUpdateOperationsInput | $Enums.ButtonStyle
    buttonShape?: EnumButtonShapeFieldUpdateOperationsInput | $Enums.ButtonShape
    buttonColor?: StringFieldUpdateOperationsInput | string
    textColor?: StringFieldUpdateOperationsInput | string
    accentColor?: StringFieldUpdateOperationsInput | string
    fontFamily?: EnumFontFamilyFieldUpdateOperationsInput | $Enums.FontFamily
    showBranding?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileLinkUpsertWithWhereUniqueWithoutUserInput = {
    where: ProfileLinkWhereUniqueInput
    update: XOR<ProfileLinkUpdateWithoutUserInput, ProfileLinkUncheckedUpdateWithoutUserInput>
    create: XOR<ProfileLinkCreateWithoutUserInput, ProfileLinkUncheckedCreateWithoutUserInput>
  }

  export type ProfileLinkUpdateWithWhereUniqueWithoutUserInput = {
    where: ProfileLinkWhereUniqueInput
    data: XOR<ProfileLinkUpdateWithoutUserInput, ProfileLinkUncheckedUpdateWithoutUserInput>
  }

  export type ProfileLinkUpdateManyWithWhereWithoutUserInput = {
    where: ProfileLinkScalarWhereInput
    data: XOR<ProfileLinkUpdateManyMutationInput, ProfileLinkUncheckedUpdateManyWithoutUserInput>
  }

  export type ProfileLinkScalarWhereInput = {
    AND?: ProfileLinkScalarWhereInput | ProfileLinkScalarWhereInput[]
    OR?: ProfileLinkScalarWhereInput[]
    NOT?: ProfileLinkScalarWhereInput | ProfileLinkScalarWhereInput[]
    id?: StringFilter<"ProfileLink"> | string
    userId?: StringFilter<"ProfileLink"> | string
    title?: StringFilter<"ProfileLink"> | string
    url?: StringFilter<"ProfileLink"> | string
    iconUrl?: StringNullableFilter<"ProfileLink"> | string | null
    position?: IntFilter<"ProfileLink"> | number
    enabled?: BoolFilter<"ProfileLink"> | boolean
    createdAt?: DateTimeFilter<"ProfileLink"> | Date | string
    updatedAt?: DateTimeFilter<"ProfileLink"> | Date | string
  }

  export type ClickEventUpsertWithWhereUniqueWithoutUserInput = {
    where: ClickEventWhereUniqueInput
    update: XOR<ClickEventUpdateWithoutUserInput, ClickEventUncheckedUpdateWithoutUserInput>
    create: XOR<ClickEventCreateWithoutUserInput, ClickEventUncheckedCreateWithoutUserInput>
  }

  export type ClickEventUpdateWithWhereUniqueWithoutUserInput = {
    where: ClickEventWhereUniqueInput
    data: XOR<ClickEventUpdateWithoutUserInput, ClickEventUncheckedUpdateWithoutUserInput>
  }

  export type ClickEventUpdateManyWithWhereWithoutUserInput = {
    where: ClickEventScalarWhereInput
    data: XOR<ClickEventUpdateManyMutationInput, ClickEventUncheckedUpdateManyWithoutUserInput>
  }

  export type ClickEventScalarWhereInput = {
    AND?: ClickEventScalarWhereInput | ClickEventScalarWhereInput[]
    OR?: ClickEventScalarWhereInput[]
    NOT?: ClickEventScalarWhereInput | ClickEventScalarWhereInput[]
    id?: StringFilter<"ClickEvent"> | string
    linkId?: StringFilter<"ClickEvent"> | string
    userId?: StringFilter<"ClickEvent"> | string
    createdAt?: DateTimeFilter<"ClickEvent"> | Date | string
    referrer?: StringNullableFilter<"ClickEvent"> | string | null
    userAgent?: StringNullableFilter<"ClickEvent"> | string | null
    country?: StringNullableFilter<"ClickEvent"> | string | null
    visitorHash?: StringNullableFilter<"ClickEvent"> | string | null
  }

  export type UserCreateWithoutThemeInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    links?: ProfileLinkCreateNestedManyWithoutUserInput
    clicks?: ClickEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutThemeInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    links?: ProfileLinkUncheckedCreateNestedManyWithoutUserInput
    clicks?: ClickEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutThemeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutThemeInput, UserUncheckedCreateWithoutThemeInput>
  }

  export type UserUpsertWithoutThemeInput = {
    update: XOR<UserUpdateWithoutThemeInput, UserUncheckedUpdateWithoutThemeInput>
    create: XOR<UserCreateWithoutThemeInput, UserUncheckedCreateWithoutThemeInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutThemeInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutThemeInput, UserUncheckedUpdateWithoutThemeInput>
  }

  export type UserUpdateWithoutThemeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    links?: ProfileLinkUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutThemeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    links?: ProfileLinkUncheckedUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutLinksInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    theme?: ThemeCreateNestedOneWithoutUserInput
    clicks?: ClickEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLinksInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    theme?: ThemeUncheckedCreateNestedOneWithoutUserInput
    clicks?: ClickEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLinksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLinksInput, UserUncheckedCreateWithoutLinksInput>
  }

  export type ClickEventCreateWithoutLinkInput = {
    id?: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
    user: UserCreateNestedOneWithoutClicksInput
  }

  export type ClickEventUncheckedCreateWithoutLinkInput = {
    id?: string
    userId: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
  }

  export type ClickEventCreateOrConnectWithoutLinkInput = {
    where: ClickEventWhereUniqueInput
    create: XOR<ClickEventCreateWithoutLinkInput, ClickEventUncheckedCreateWithoutLinkInput>
  }

  export type ClickEventCreateManyLinkInputEnvelope = {
    data: ClickEventCreateManyLinkInput | ClickEventCreateManyLinkInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutLinksInput = {
    update: XOR<UserUpdateWithoutLinksInput, UserUncheckedUpdateWithoutLinksInput>
    create: XOR<UserCreateWithoutLinksInput, UserUncheckedCreateWithoutLinksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLinksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLinksInput, UserUncheckedUpdateWithoutLinksInput>
  }

  export type UserUpdateWithoutLinksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    theme?: ThemeUpdateOneWithoutUserNestedInput
    clicks?: ClickEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLinksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    theme?: ThemeUncheckedUpdateOneWithoutUserNestedInput
    clicks?: ClickEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ClickEventUpsertWithWhereUniqueWithoutLinkInput = {
    where: ClickEventWhereUniqueInput
    update: XOR<ClickEventUpdateWithoutLinkInput, ClickEventUncheckedUpdateWithoutLinkInput>
    create: XOR<ClickEventCreateWithoutLinkInput, ClickEventUncheckedCreateWithoutLinkInput>
  }

  export type ClickEventUpdateWithWhereUniqueWithoutLinkInput = {
    where: ClickEventWhereUniqueInput
    data: XOR<ClickEventUpdateWithoutLinkInput, ClickEventUncheckedUpdateWithoutLinkInput>
  }

  export type ClickEventUpdateManyWithWhereWithoutLinkInput = {
    where: ClickEventScalarWhereInput
    data: XOR<ClickEventUpdateManyMutationInput, ClickEventUncheckedUpdateManyWithoutLinkInput>
  }

  export type ProfileLinkCreateWithoutClicksInput = {
    id: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutLinksInput
  }

  export type ProfileLinkUncheckedCreateWithoutClicksInput = {
    id: string
    userId: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProfileLinkCreateOrConnectWithoutClicksInput = {
    where: ProfileLinkWhereUniqueInput
    create: XOR<ProfileLinkCreateWithoutClicksInput, ProfileLinkUncheckedCreateWithoutClicksInput>
  }

  export type UserCreateWithoutClicksInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    theme?: ThemeCreateNestedOneWithoutUserInput
    links?: ProfileLinkCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutClicksInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    theme?: ThemeUncheckedCreateNestedOneWithoutUserInput
    links?: ProfileLinkUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutClicksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClicksInput, UserUncheckedCreateWithoutClicksInput>
  }

  export type ProfileLinkUpsertWithoutClicksInput = {
    update: XOR<ProfileLinkUpdateWithoutClicksInput, ProfileLinkUncheckedUpdateWithoutClicksInput>
    create: XOR<ProfileLinkCreateWithoutClicksInput, ProfileLinkUncheckedCreateWithoutClicksInput>
    where?: ProfileLinkWhereInput
  }

  export type ProfileLinkUpdateToOneWithWhereWithoutClicksInput = {
    where?: ProfileLinkWhereInput
    data: XOR<ProfileLinkUpdateWithoutClicksInput, ProfileLinkUncheckedUpdateWithoutClicksInput>
  }

  export type ProfileLinkUpdateWithoutClicksInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutLinksNestedInput
  }

  export type ProfileLinkUncheckedUpdateWithoutClicksInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutClicksInput = {
    update: XOR<UserUpdateWithoutClicksInput, UserUncheckedUpdateWithoutClicksInput>
    create: XOR<UserCreateWithoutClicksInput, UserUncheckedCreateWithoutClicksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutClicksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutClicksInput, UserUncheckedUpdateWithoutClicksInput>
  }

  export type UserUpdateWithoutClicksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    theme?: ThemeUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutClicksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    theme?: ThemeUncheckedUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAccountsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    theme?: ThemeCreateNestedOneWithoutUserInput
    links?: ProfileLinkCreateNestedManyWithoutUserInput
    clicks?: ClickEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAccountsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    theme?: ThemeUncheckedCreateNestedOneWithoutUserInput
    links?: ProfileLinkUncheckedCreateNestedManyWithoutUserInput
    clicks?: ClickEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
  }

  export type UserUpsertWithoutAccountsInput = {
    update: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    theme?: ThemeUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    theme?: ThemeUncheckedUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUncheckedUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountCreateNestedManyWithoutUserInput
    theme?: ThemeCreateNestedOneWithoutUserInput
    links?: ProfileLinkCreateNestedManyWithoutUserInput
    clicks?: ClickEventCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    username?: string | null
    usernameNormalized?: string | null
    bio?: string
    onboardedAt?: Date | string | null
    editorRevision?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    theme?: ThemeUncheckedCreateNestedOneWithoutUserInput
    links?: ProfileLinkUncheckedCreateNestedManyWithoutUserInput
    clicks?: ClickEventUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    theme?: ThemeUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    usernameNormalized?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: StringFieldUpdateOperationsInput | string
    onboardedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    editorRevision?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    theme?: ThemeUncheckedUpdateOneWithoutUserNestedInput
    links?: ProfileLinkUncheckedUpdateManyWithoutUserNestedInput
    clicks?: ClickEventUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AccountCreateManyUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    refresh_token_expires_in?: number | null
  }

  export type SessionCreateManyUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type ProfileLinkCreateManyUserInput = {
    id: string
    title: string
    url: string
    iconUrl?: string | null
    position: number
    enabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClickEventCreateManyUserInput = {
    id?: string
    linkId: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
  }

  export type AccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type AccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type AccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    refresh_token_expires_in?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileLinkUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clicks?: ClickEventUpdateManyWithoutLinkNestedInput
  }

  export type ProfileLinkUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clicks?: ClickEventUncheckedUpdateManyWithoutLinkNestedInput
  }

  export type ProfileLinkUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    position?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClickEventUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
    link?: ProfileLinkUpdateOneRequiredWithoutClicksNestedInput
  }

  export type ClickEventUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    linkId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClickEventUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    linkId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClickEventCreateManyLinkInput = {
    id?: string
    userId: string
    createdAt?: Date | string
    referrer?: string | null
    userAgent?: string | null
    country?: string | null
    visitorHash?: string | null
  }

  export type ClickEventUpdateWithoutLinkInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutClicksNestedInput
  }

  export type ClickEventUncheckedUpdateWithoutLinkInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClickEventUncheckedUpdateManyWithoutLinkInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    visitorHash?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}