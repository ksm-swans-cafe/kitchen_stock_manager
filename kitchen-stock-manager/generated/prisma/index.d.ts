
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
 * Model cart
 * 
 */
export type cart = $Result.DefaultSelection<Prisma.$cartPayload>
/**
 * Model employee
 * 
 */
export type employee = $Result.DefaultSelection<Prisma.$employeePayload>
/**
 * Model ingredient_transactions
 * This table contains check constraints and requires additional setup for migrations. Visit https://pris.ly/d/check-constraints for more info.
 */
export type ingredient_transactions = $Result.DefaultSelection<Prisma.$ingredient_transactionsPayload>
/**
 * Model ingredients
 * 
 */
export type ingredients = $Result.DefaultSelection<Prisma.$ingredientsPayload>
/**
 * Model menu
 * 
 */
export type menu = $Result.DefaultSelection<Prisma.$menuPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Carts
 * const carts = await prisma.cart.findMany()
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
   * // Fetch zero or more Carts
   * const carts = await prisma.cart.findMany()
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
   * `prisma.cart`: Exposes CRUD operations for the **cart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Carts
    * const carts = await prisma.cart.findMany()
    * ```
    */
  get cart(): Prisma.cartDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.employee`: Exposes CRUD operations for the **employee** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Employees
    * const employees = await prisma.employee.findMany()
    * ```
    */
  get employee(): Prisma.employeeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ingredient_transactions`: Exposes CRUD operations for the **ingredient_transactions** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ingredient_transactions
    * const ingredient_transactions = await prisma.ingredient_transactions.findMany()
    * ```
    */
  get ingredient_transactions(): Prisma.ingredient_transactionsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ingredients`: Exposes CRUD operations for the **ingredients** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ingredients
    * const ingredients = await prisma.ingredients.findMany()
    * ```
    */
  get ingredients(): Prisma.ingredientsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.menu`: Exposes CRUD operations for the **menu** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Menus
    * const menus = await prisma.menu.findMany()
    * ```
    */
  get menu(): Prisma.menuDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.14.0
   * Query Engine version: 717184b7b35ea05dfa71a3236b7af656013e1e49
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


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
    cart: 'cart',
    employee: 'employee',
    ingredient_transactions: 'ingredient_transactions',
    ingredients: 'ingredients',
    menu: 'menu'
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
      modelProps: "cart" | "employee" | "ingredient_transactions" | "ingredients" | "menu"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      cart: {
        payload: Prisma.$cartPayload<ExtArgs>
        fields: Prisma.cartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.cartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.cartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>
          }
          findFirst: {
            args: Prisma.cartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.cartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>
          }
          findMany: {
            args: Prisma.cartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>[]
          }
          create: {
            args: Prisma.cartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>
          }
          createMany: {
            args: Prisma.cartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.cartCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>[]
          }
          delete: {
            args: Prisma.cartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>
          }
          update: {
            args: Prisma.cartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>
          }
          deleteMany: {
            args: Prisma.cartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.cartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.cartUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>[]
          }
          upsert: {
            args: Prisma.cartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cartPayload>
          }
          aggregate: {
            args: Prisma.CartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCart>
          }
          groupBy: {
            args: Prisma.cartGroupByArgs<ExtArgs>
            result: $Utils.Optional<CartGroupByOutputType>[]
          }
          count: {
            args: Prisma.cartCountArgs<ExtArgs>
            result: $Utils.Optional<CartCountAggregateOutputType> | number
          }
        }
      }
      employee: {
        payload: Prisma.$employeePayload<ExtArgs>
        fields: Prisma.employeeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.employeeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.employeeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>
          }
          findFirst: {
            args: Prisma.employeeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.employeeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>
          }
          findMany: {
            args: Prisma.employeeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>[]
          }
          create: {
            args: Prisma.employeeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>
          }
          createMany: {
            args: Prisma.employeeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.employeeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>[]
          }
          delete: {
            args: Prisma.employeeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>
          }
          update: {
            args: Prisma.employeeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>
          }
          deleteMany: {
            args: Prisma.employeeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.employeeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.employeeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>[]
          }
          upsert: {
            args: Prisma.employeeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$employeePayload>
          }
          aggregate: {
            args: Prisma.EmployeeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmployee>
          }
          groupBy: {
            args: Prisma.employeeGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmployeeGroupByOutputType>[]
          }
          count: {
            args: Prisma.employeeCountArgs<ExtArgs>
            result: $Utils.Optional<EmployeeCountAggregateOutputType> | number
          }
        }
      }
      ingredient_transactions: {
        payload: Prisma.$ingredient_transactionsPayload<ExtArgs>
        fields: Prisma.ingredient_transactionsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ingredient_transactionsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ingredient_transactionsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>
          }
          findFirst: {
            args: Prisma.ingredient_transactionsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ingredient_transactionsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>
          }
          findMany: {
            args: Prisma.ingredient_transactionsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>[]
          }
          create: {
            args: Prisma.ingredient_transactionsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>
          }
          createMany: {
            args: Prisma.ingredient_transactionsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ingredient_transactionsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>[]
          }
          delete: {
            args: Prisma.ingredient_transactionsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>
          }
          update: {
            args: Prisma.ingredient_transactionsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>
          }
          deleteMany: {
            args: Prisma.ingredient_transactionsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ingredient_transactionsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ingredient_transactionsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>[]
          }
          upsert: {
            args: Prisma.ingredient_transactionsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionsPayload>
          }
          aggregate: {
            args: Prisma.Ingredient_transactionsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngredient_transactions>
          }
          groupBy: {
            args: Prisma.ingredient_transactionsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ingredient_transactionsGroupByOutputType>[]
          }
          count: {
            args: Prisma.ingredient_transactionsCountArgs<ExtArgs>
            result: $Utils.Optional<Ingredient_transactionsCountAggregateOutputType> | number
          }
        }
      }
      ingredients: {
        payload: Prisma.$ingredientsPayload<ExtArgs>
        fields: Prisma.ingredientsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ingredientsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ingredientsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>
          }
          findFirst: {
            args: Prisma.ingredientsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ingredientsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>
          }
          findMany: {
            args: Prisma.ingredientsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>[]
          }
          create: {
            args: Prisma.ingredientsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>
          }
          createMany: {
            args: Prisma.ingredientsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ingredientsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>[]
          }
          delete: {
            args: Prisma.ingredientsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>
          }
          update: {
            args: Prisma.ingredientsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>
          }
          deleteMany: {
            args: Prisma.ingredientsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ingredientsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ingredientsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>[]
          }
          upsert: {
            args: Prisma.ingredientsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredientsPayload>
          }
          aggregate: {
            args: Prisma.IngredientsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngredients>
          }
          groupBy: {
            args: Prisma.ingredientsGroupByArgs<ExtArgs>
            result: $Utils.Optional<IngredientsGroupByOutputType>[]
          }
          count: {
            args: Prisma.ingredientsCountArgs<ExtArgs>
            result: $Utils.Optional<IngredientsCountAggregateOutputType> | number
          }
        }
      }
      menu: {
        payload: Prisma.$menuPayload<ExtArgs>
        fields: Prisma.menuFieldRefs
        operations: {
          findUnique: {
            args: Prisma.menuFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.menuFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>
          }
          findFirst: {
            args: Prisma.menuFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.menuFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>
          }
          findMany: {
            args: Prisma.menuFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>[]
          }
          create: {
            args: Prisma.menuCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>
          }
          createMany: {
            args: Prisma.menuCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.menuCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>[]
          }
          delete: {
            args: Prisma.menuDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>
          }
          update: {
            args: Prisma.menuUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>
          }
          deleteMany: {
            args: Prisma.menuDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.menuUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.menuUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>[]
          }
          upsert: {
            args: Prisma.menuUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$menuPayload>
          }
          aggregate: {
            args: Prisma.MenuAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMenu>
          }
          groupBy: {
            args: Prisma.menuGroupByArgs<ExtArgs>
            result: $Utils.Optional<MenuGroupByOutputType>[]
          }
          count: {
            args: Prisma.menuCountArgs<ExtArgs>
            result: $Utils.Optional<MenuCountAggregateOutputType> | number
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
    cart?: cartOmit
    employee?: employeeOmit
    ingredient_transactions?: ingredient_transactionsOmit
    ingredients?: ingredientsOmit
    menu?: menuOmit
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
   * Models
   */

  /**
   * Model cart
   */

  export type AggregateCart = {
    _count: CartCountAggregateOutputType | null
    _min: CartMinAggregateOutputType | null
    _max: CartMaxAggregateOutputType | null
  }

  export type CartMinAggregateOutputType = {
    cart_id: string | null
    cart_username: string | null
    cart_create_date: Date | null
    cart_status: string | null
    cart_order_number: string | null
    cart_last_update: string | null
    cart_customer_name: string | null
    cart_customer_tel: string | null
    cart_location_send: string | null
    cart_delivery_date: string | null
    cart_export_time: string | null
    cart_receive_time: string | null
  }

  export type CartMaxAggregateOutputType = {
    cart_id: string | null
    cart_username: string | null
    cart_create_date: Date | null
    cart_status: string | null
    cart_order_number: string | null
    cart_last_update: string | null
    cart_customer_name: string | null
    cart_customer_tel: string | null
    cart_location_send: string | null
    cart_delivery_date: string | null
    cart_export_time: string | null
    cart_receive_time: string | null
  }

  export type CartCountAggregateOutputType = {
    cart_id: number
    cart_username: number
    cart_menu_items: number
    cart_create_date: number
    cart_status: number
    cart_order_number: number
    cart_last_update: number
    cart_customer_name: number
    cart_customer_tel: number
    cart_location_send: number
    cart_delivery_date: number
    cart_export_time: number
    cart_receive_time: number
    _all: number
  }


  export type CartMinAggregateInputType = {
    cart_id?: true
    cart_username?: true
    cart_create_date?: true
    cart_status?: true
    cart_order_number?: true
    cart_last_update?: true
    cart_customer_name?: true
    cart_customer_tel?: true
    cart_location_send?: true
    cart_delivery_date?: true
    cart_export_time?: true
    cart_receive_time?: true
  }

  export type CartMaxAggregateInputType = {
    cart_id?: true
    cart_username?: true
    cart_create_date?: true
    cart_status?: true
    cart_order_number?: true
    cart_last_update?: true
    cart_customer_name?: true
    cart_customer_tel?: true
    cart_location_send?: true
    cart_delivery_date?: true
    cart_export_time?: true
    cart_receive_time?: true
  }

  export type CartCountAggregateInputType = {
    cart_id?: true
    cart_username?: true
    cart_menu_items?: true
    cart_create_date?: true
    cart_status?: true
    cart_order_number?: true
    cart_last_update?: true
    cart_customer_name?: true
    cart_customer_tel?: true
    cart_location_send?: true
    cart_delivery_date?: true
    cart_export_time?: true
    cart_receive_time?: true
    _all?: true
  }

  export type CartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which cart to aggregate.
     */
    where?: cartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carts to fetch.
     */
    orderBy?: cartOrderByWithRelationInput | cartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: cartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned carts
    **/
    _count?: true | CartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CartMaxAggregateInputType
  }

  export type GetCartAggregateType<T extends CartAggregateArgs> = {
        [P in keyof T & keyof AggregateCart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCart[P]>
      : GetScalarType<T[P], AggregateCart[P]>
  }




  export type cartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: cartWhereInput
    orderBy?: cartOrderByWithAggregationInput | cartOrderByWithAggregationInput[]
    by: CartScalarFieldEnum[] | CartScalarFieldEnum
    having?: cartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CartCountAggregateInputType | true
    _min?: CartMinAggregateInputType
    _max?: CartMaxAggregateInputType
  }

  export type CartGroupByOutputType = {
    cart_id: string
    cart_username: string
    cart_menu_items: JsonValue
    cart_create_date: Date | null
    cart_status: string | null
    cart_order_number: string | null
    cart_last_update: string | null
    cart_customer_name: string | null
    cart_customer_tel: string | null
    cart_location_send: string | null
    cart_delivery_date: string | null
    cart_export_time: string | null
    cart_receive_time: string | null
    _count: CartCountAggregateOutputType | null
    _min: CartMinAggregateOutputType | null
    _max: CartMaxAggregateOutputType | null
  }

  type GetCartGroupByPayload<T extends cartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CartGroupByOutputType[P]>
            : GetScalarType<T[P], CartGroupByOutputType[P]>
        }
      >
    >


  export type cartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    cart_id?: boolean
    cart_username?: boolean
    cart_menu_items?: boolean
    cart_create_date?: boolean
    cart_status?: boolean
    cart_order_number?: boolean
    cart_last_update?: boolean
    cart_customer_name?: boolean
    cart_customer_tel?: boolean
    cart_location_send?: boolean
    cart_delivery_date?: boolean
    cart_export_time?: boolean
    cart_receive_time?: boolean
  }, ExtArgs["result"]["cart"]>

  export type cartSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    cart_id?: boolean
    cart_username?: boolean
    cart_menu_items?: boolean
    cart_create_date?: boolean
    cart_status?: boolean
    cart_order_number?: boolean
    cart_last_update?: boolean
    cart_customer_name?: boolean
    cart_customer_tel?: boolean
    cart_location_send?: boolean
    cart_delivery_date?: boolean
    cart_export_time?: boolean
    cart_receive_time?: boolean
  }, ExtArgs["result"]["cart"]>

  export type cartSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    cart_id?: boolean
    cart_username?: boolean
    cart_menu_items?: boolean
    cart_create_date?: boolean
    cart_status?: boolean
    cart_order_number?: boolean
    cart_last_update?: boolean
    cart_customer_name?: boolean
    cart_customer_tel?: boolean
    cart_location_send?: boolean
    cart_delivery_date?: boolean
    cart_export_time?: boolean
    cart_receive_time?: boolean
  }, ExtArgs["result"]["cart"]>

  export type cartSelectScalar = {
    cart_id?: boolean
    cart_username?: boolean
    cart_menu_items?: boolean
    cart_create_date?: boolean
    cart_status?: boolean
    cart_order_number?: boolean
    cart_last_update?: boolean
    cart_customer_name?: boolean
    cart_customer_tel?: boolean
    cart_location_send?: boolean
    cart_delivery_date?: boolean
    cart_export_time?: boolean
    cart_receive_time?: boolean
  }

  export type cartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"cart_id" | "cart_username" | "cart_menu_items" | "cart_create_date" | "cart_status" | "cart_order_number" | "cart_last_update" | "cart_customer_name" | "cart_customer_tel" | "cart_location_send" | "cart_delivery_date" | "cart_export_time" | "cart_receive_time", ExtArgs["result"]["cart"]>

  export type $cartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "cart"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      cart_id: string
      cart_username: string
      cart_menu_items: Prisma.JsonValue
      cart_create_date: Date | null
      cart_status: string | null
      cart_order_number: string | null
      cart_last_update: string | null
      cart_customer_name: string | null
      cart_customer_tel: string | null
      cart_location_send: string | null
      cart_delivery_date: string | null
      cart_export_time: string | null
      cart_receive_time: string | null
    }, ExtArgs["result"]["cart"]>
    composites: {}
  }

  type cartGetPayload<S extends boolean | null | undefined | cartDefaultArgs> = $Result.GetResult<Prisma.$cartPayload, S>

  type cartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<cartFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CartCountAggregateInputType | true
    }

  export interface cartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['cart'], meta: { name: 'cart' } }
    /**
     * Find zero or one Cart that matches the filter.
     * @param {cartFindUniqueArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends cartFindUniqueArgs>(args: SelectSubset<T, cartFindUniqueArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cart that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {cartFindUniqueOrThrowArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends cartFindUniqueOrThrowArgs>(args: SelectSubset<T, cartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cartFindFirstArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends cartFindFirstArgs>(args?: SelectSubset<T, cartFindFirstArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cartFindFirstOrThrowArgs} args - Arguments to find a Cart
     * @example
     * // Get one Cart
     * const cart = await prisma.cart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends cartFindFirstOrThrowArgs>(args?: SelectSubset<T, cartFindFirstOrThrowArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Carts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Carts
     * const carts = await prisma.cart.findMany()
     * 
     * // Get first 10 Carts
     * const carts = await prisma.cart.findMany({ take: 10 })
     * 
     * // Only select the `cart_id`
     * const cartWithCart_idOnly = await prisma.cart.findMany({ select: { cart_id: true } })
     * 
     */
    findMany<T extends cartFindManyArgs>(args?: SelectSubset<T, cartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cart.
     * @param {cartCreateArgs} args - Arguments to create a Cart.
     * @example
     * // Create one Cart
     * const Cart = await prisma.cart.create({
     *   data: {
     *     // ... data to create a Cart
     *   }
     * })
     * 
     */
    create<T extends cartCreateArgs>(args: SelectSubset<T, cartCreateArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Carts.
     * @param {cartCreateManyArgs} args - Arguments to create many Carts.
     * @example
     * // Create many Carts
     * const cart = await prisma.cart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends cartCreateManyArgs>(args?: SelectSubset<T, cartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Carts and returns the data saved in the database.
     * @param {cartCreateManyAndReturnArgs} args - Arguments to create many Carts.
     * @example
     * // Create many Carts
     * const cart = await prisma.cart.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Carts and only return the `cart_id`
     * const cartWithCart_idOnly = await prisma.cart.createManyAndReturn({
     *   select: { cart_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends cartCreateManyAndReturnArgs>(args?: SelectSubset<T, cartCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cart.
     * @param {cartDeleteArgs} args - Arguments to delete one Cart.
     * @example
     * // Delete one Cart
     * const Cart = await prisma.cart.delete({
     *   where: {
     *     // ... filter to delete one Cart
     *   }
     * })
     * 
     */
    delete<T extends cartDeleteArgs>(args: SelectSubset<T, cartDeleteArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cart.
     * @param {cartUpdateArgs} args - Arguments to update one Cart.
     * @example
     * // Update one Cart
     * const cart = await prisma.cart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends cartUpdateArgs>(args: SelectSubset<T, cartUpdateArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Carts.
     * @param {cartDeleteManyArgs} args - Arguments to filter Carts to delete.
     * @example
     * // Delete a few Carts
     * const { count } = await prisma.cart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends cartDeleteManyArgs>(args?: SelectSubset<T, cartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Carts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Carts
     * const cart = await prisma.cart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends cartUpdateManyArgs>(args: SelectSubset<T, cartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Carts and returns the data updated in the database.
     * @param {cartUpdateManyAndReturnArgs} args - Arguments to update many Carts.
     * @example
     * // Update many Carts
     * const cart = await prisma.cart.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Carts and only return the `cart_id`
     * const cartWithCart_idOnly = await prisma.cart.updateManyAndReturn({
     *   select: { cart_id: true },
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
    updateManyAndReturn<T extends cartUpdateManyAndReturnArgs>(args: SelectSubset<T, cartUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cart.
     * @param {cartUpsertArgs} args - Arguments to update or create a Cart.
     * @example
     * // Update or create a Cart
     * const cart = await prisma.cart.upsert({
     *   create: {
     *     // ... data to create a Cart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cart we want to update
     *   }
     * })
     */
    upsert<T extends cartUpsertArgs>(args: SelectSubset<T, cartUpsertArgs<ExtArgs>>): Prisma__cartClient<$Result.GetResult<Prisma.$cartPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Carts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cartCountArgs} args - Arguments to filter Carts to count.
     * @example
     * // Count the number of Carts
     * const count = await prisma.cart.count({
     *   where: {
     *     // ... the filter for the Carts we want to count
     *   }
     * })
    **/
    count<T extends cartCountArgs>(
      args?: Subset<T, cartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CartAggregateArgs>(args: Subset<T, CartAggregateArgs>): Prisma.PrismaPromise<GetCartAggregateType<T>>

    /**
     * Group by Cart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cartGroupByArgs} args - Group by arguments.
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
      T extends cartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: cartGroupByArgs['orderBy'] }
        : { orderBy?: cartGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, cartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the cart model
   */
  readonly fields: cartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for cart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__cartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the cart model
   */
  interface cartFieldRefs {
    readonly cart_id: FieldRef<"cart", 'String'>
    readonly cart_username: FieldRef<"cart", 'String'>
    readonly cart_menu_items: FieldRef<"cart", 'Json'>
    readonly cart_create_date: FieldRef<"cart", 'DateTime'>
    readonly cart_status: FieldRef<"cart", 'String'>
    readonly cart_order_number: FieldRef<"cart", 'String'>
    readonly cart_last_update: FieldRef<"cart", 'String'>
    readonly cart_customer_name: FieldRef<"cart", 'String'>
    readonly cart_customer_tel: FieldRef<"cart", 'String'>
    readonly cart_location_send: FieldRef<"cart", 'String'>
    readonly cart_delivery_date: FieldRef<"cart", 'String'>
    readonly cart_export_time: FieldRef<"cart", 'String'>
    readonly cart_receive_time: FieldRef<"cart", 'String'>
  }
    

  // Custom InputTypes
  /**
   * cart findUnique
   */
  export type cartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * Filter, which cart to fetch.
     */
    where: cartWhereUniqueInput
  }

  /**
   * cart findUniqueOrThrow
   */
  export type cartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * Filter, which cart to fetch.
     */
    where: cartWhereUniqueInput
  }

  /**
   * cart findFirst
   */
  export type cartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * Filter, which cart to fetch.
     */
    where?: cartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carts to fetch.
     */
    orderBy?: cartOrderByWithRelationInput | cartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for carts.
     */
    cursor?: cartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of carts.
     */
    distinct?: CartScalarFieldEnum | CartScalarFieldEnum[]
  }

  /**
   * cart findFirstOrThrow
   */
  export type cartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * Filter, which cart to fetch.
     */
    where?: cartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carts to fetch.
     */
    orderBy?: cartOrderByWithRelationInput | cartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for carts.
     */
    cursor?: cartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of carts.
     */
    distinct?: CartScalarFieldEnum | CartScalarFieldEnum[]
  }

  /**
   * cart findMany
   */
  export type cartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * Filter, which carts to fetch.
     */
    where?: cartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carts to fetch.
     */
    orderBy?: cartOrderByWithRelationInput | cartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing carts.
     */
    cursor?: cartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carts.
     */
    skip?: number
    distinct?: CartScalarFieldEnum | CartScalarFieldEnum[]
  }

  /**
   * cart create
   */
  export type cartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * The data needed to create a cart.
     */
    data: XOR<cartCreateInput, cartUncheckedCreateInput>
  }

  /**
   * cart createMany
   */
  export type cartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many carts.
     */
    data: cartCreateManyInput | cartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * cart createManyAndReturn
   */
  export type cartCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * The data used to create many carts.
     */
    data: cartCreateManyInput | cartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * cart update
   */
  export type cartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * The data needed to update a cart.
     */
    data: XOR<cartUpdateInput, cartUncheckedUpdateInput>
    /**
     * Choose, which cart to update.
     */
    where: cartWhereUniqueInput
  }

  /**
   * cart updateMany
   */
  export type cartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update carts.
     */
    data: XOR<cartUpdateManyMutationInput, cartUncheckedUpdateManyInput>
    /**
     * Filter which carts to update
     */
    where?: cartWhereInput
    /**
     * Limit how many carts to update.
     */
    limit?: number
  }

  /**
   * cart updateManyAndReturn
   */
  export type cartUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * The data used to update carts.
     */
    data: XOR<cartUpdateManyMutationInput, cartUncheckedUpdateManyInput>
    /**
     * Filter which carts to update
     */
    where?: cartWhereInput
    /**
     * Limit how many carts to update.
     */
    limit?: number
  }

  /**
   * cart upsert
   */
  export type cartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * The filter to search for the cart to update in case it exists.
     */
    where: cartWhereUniqueInput
    /**
     * In case the cart found by the `where` argument doesn't exist, create a new cart with this data.
     */
    create: XOR<cartCreateInput, cartUncheckedCreateInput>
    /**
     * In case the cart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<cartUpdateInput, cartUncheckedUpdateInput>
  }

  /**
   * cart delete
   */
  export type cartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
    /**
     * Filter which cart to delete.
     */
    where: cartWhereUniqueInput
  }

  /**
   * cart deleteMany
   */
  export type cartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which carts to delete
     */
    where?: cartWhereInput
    /**
     * Limit how many carts to delete.
     */
    limit?: number
  }

  /**
   * cart without action
   */
  export type cartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cart
     */
    select?: cartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cart
     */
    omit?: cartOmit<ExtArgs> | null
  }


  /**
   * Model employee
   */

  export type AggregateEmployee = {
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  export type EmployeeAvgAggregateOutputType = {
    employee_pin: Decimal | null
  }

  export type EmployeeSumAggregateOutputType = {
    employee_pin: Decimal | null
  }

  export type EmployeeMinAggregateOutputType = {
    employee_id: string | null
    employee_username: string | null
    employee_firstname: string | null
    employee_lastname: string | null
    employee_pin: Decimal | null
    employee_role: string | null
  }

  export type EmployeeMaxAggregateOutputType = {
    employee_id: string | null
    employee_username: string | null
    employee_firstname: string | null
    employee_lastname: string | null
    employee_pin: Decimal | null
    employee_role: string | null
  }

  export type EmployeeCountAggregateOutputType = {
    employee_id: number
    employee_username: number
    employee_firstname: number
    employee_lastname: number
    employee_pin: number
    employee_role: number
    _all: number
  }


  export type EmployeeAvgAggregateInputType = {
    employee_pin?: true
  }

  export type EmployeeSumAggregateInputType = {
    employee_pin?: true
  }

  export type EmployeeMinAggregateInputType = {
    employee_id?: true
    employee_username?: true
    employee_firstname?: true
    employee_lastname?: true
    employee_pin?: true
    employee_role?: true
  }

  export type EmployeeMaxAggregateInputType = {
    employee_id?: true
    employee_username?: true
    employee_firstname?: true
    employee_lastname?: true
    employee_pin?: true
    employee_role?: true
  }

  export type EmployeeCountAggregateInputType = {
    employee_id?: true
    employee_username?: true
    employee_firstname?: true
    employee_lastname?: true
    employee_pin?: true
    employee_role?: true
    _all?: true
  }

  export type EmployeeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which employee to aggregate.
     */
    where?: employeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of employees to fetch.
     */
    orderBy?: employeeOrderByWithRelationInput | employeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: employeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned employees
    **/
    _count?: true | EmployeeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmployeeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmployeeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmployeeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmployeeMaxAggregateInputType
  }

  export type GetEmployeeAggregateType<T extends EmployeeAggregateArgs> = {
        [P in keyof T & keyof AggregateEmployee]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmployee[P]>
      : GetScalarType<T[P], AggregateEmployee[P]>
  }




  export type employeeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: employeeWhereInput
    orderBy?: employeeOrderByWithAggregationInput | employeeOrderByWithAggregationInput[]
    by: EmployeeScalarFieldEnum[] | EmployeeScalarFieldEnum
    having?: employeeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmployeeCountAggregateInputType | true
    _avg?: EmployeeAvgAggregateInputType
    _sum?: EmployeeSumAggregateInputType
    _min?: EmployeeMinAggregateInputType
    _max?: EmployeeMaxAggregateInputType
  }

  export type EmployeeGroupByOutputType = {
    employee_id: string
    employee_username: string | null
    employee_firstname: string | null
    employee_lastname: string | null
    employee_pin: Decimal | null
    employee_role: string | null
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  type GetEmployeeGroupByPayload<T extends employeeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmployeeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmployeeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
            : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
        }
      >
    >


  export type employeeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    employee_id?: boolean
    employee_username?: boolean
    employee_firstname?: boolean
    employee_lastname?: boolean
    employee_pin?: boolean
    employee_role?: boolean
  }, ExtArgs["result"]["employee"]>

  export type employeeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    employee_id?: boolean
    employee_username?: boolean
    employee_firstname?: boolean
    employee_lastname?: boolean
    employee_pin?: boolean
    employee_role?: boolean
  }, ExtArgs["result"]["employee"]>

  export type employeeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    employee_id?: boolean
    employee_username?: boolean
    employee_firstname?: boolean
    employee_lastname?: boolean
    employee_pin?: boolean
    employee_role?: boolean
  }, ExtArgs["result"]["employee"]>

  export type employeeSelectScalar = {
    employee_id?: boolean
    employee_username?: boolean
    employee_firstname?: boolean
    employee_lastname?: boolean
    employee_pin?: boolean
    employee_role?: boolean
  }

  export type employeeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"employee_id" | "employee_username" | "employee_firstname" | "employee_lastname" | "employee_pin" | "employee_role", ExtArgs["result"]["employee"]>

  export type $employeePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "employee"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      employee_id: string
      employee_username: string | null
      employee_firstname: string | null
      employee_lastname: string | null
      employee_pin: Prisma.Decimal | null
      employee_role: string | null
    }, ExtArgs["result"]["employee"]>
    composites: {}
  }

  type employeeGetPayload<S extends boolean | null | undefined | employeeDefaultArgs> = $Result.GetResult<Prisma.$employeePayload, S>

  type employeeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<employeeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmployeeCountAggregateInputType | true
    }

  export interface employeeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['employee'], meta: { name: 'employee' } }
    /**
     * Find zero or one Employee that matches the filter.
     * @param {employeeFindUniqueArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends employeeFindUniqueArgs>(args: SelectSubset<T, employeeFindUniqueArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Employee that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {employeeFindUniqueOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends employeeFindUniqueOrThrowArgs>(args: SelectSubset<T, employeeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Employee that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {employeeFindFirstArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends employeeFindFirstArgs>(args?: SelectSubset<T, employeeFindFirstArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Employee that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {employeeFindFirstOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends employeeFindFirstOrThrowArgs>(args?: SelectSubset<T, employeeFindFirstOrThrowArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Employees that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {employeeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Employees
     * const employees = await prisma.employee.findMany()
     * 
     * // Get first 10 Employees
     * const employees = await prisma.employee.findMany({ take: 10 })
     * 
     * // Only select the `employee_id`
     * const employeeWithEmployee_idOnly = await prisma.employee.findMany({ select: { employee_id: true } })
     * 
     */
    findMany<T extends employeeFindManyArgs>(args?: SelectSubset<T, employeeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Employee.
     * @param {employeeCreateArgs} args - Arguments to create a Employee.
     * @example
     * // Create one Employee
     * const Employee = await prisma.employee.create({
     *   data: {
     *     // ... data to create a Employee
     *   }
     * })
     * 
     */
    create<T extends employeeCreateArgs>(args: SelectSubset<T, employeeCreateArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Employees.
     * @param {employeeCreateManyArgs} args - Arguments to create many Employees.
     * @example
     * // Create many Employees
     * const employee = await prisma.employee.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends employeeCreateManyArgs>(args?: SelectSubset<T, employeeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Employees and returns the data saved in the database.
     * @param {employeeCreateManyAndReturnArgs} args - Arguments to create many Employees.
     * @example
     * // Create many Employees
     * const employee = await prisma.employee.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Employees and only return the `employee_id`
     * const employeeWithEmployee_idOnly = await prisma.employee.createManyAndReturn({
     *   select: { employee_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends employeeCreateManyAndReturnArgs>(args?: SelectSubset<T, employeeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Employee.
     * @param {employeeDeleteArgs} args - Arguments to delete one Employee.
     * @example
     * // Delete one Employee
     * const Employee = await prisma.employee.delete({
     *   where: {
     *     // ... filter to delete one Employee
     *   }
     * })
     * 
     */
    delete<T extends employeeDeleteArgs>(args: SelectSubset<T, employeeDeleteArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Employee.
     * @param {employeeUpdateArgs} args - Arguments to update one Employee.
     * @example
     * // Update one Employee
     * const employee = await prisma.employee.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends employeeUpdateArgs>(args: SelectSubset<T, employeeUpdateArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Employees.
     * @param {employeeDeleteManyArgs} args - Arguments to filter Employees to delete.
     * @example
     * // Delete a few Employees
     * const { count } = await prisma.employee.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends employeeDeleteManyArgs>(args?: SelectSubset<T, employeeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {employeeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Employees
     * const employee = await prisma.employee.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends employeeUpdateManyArgs>(args: SelectSubset<T, employeeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Employees and returns the data updated in the database.
     * @param {employeeUpdateManyAndReturnArgs} args - Arguments to update many Employees.
     * @example
     * // Update many Employees
     * const employee = await prisma.employee.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Employees and only return the `employee_id`
     * const employeeWithEmployee_idOnly = await prisma.employee.updateManyAndReturn({
     *   select: { employee_id: true },
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
    updateManyAndReturn<T extends employeeUpdateManyAndReturnArgs>(args: SelectSubset<T, employeeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Employee.
     * @param {employeeUpsertArgs} args - Arguments to update or create a Employee.
     * @example
     * // Update or create a Employee
     * const employee = await prisma.employee.upsert({
     *   create: {
     *     // ... data to create a Employee
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Employee we want to update
     *   }
     * })
     */
    upsert<T extends employeeUpsertArgs>(args: SelectSubset<T, employeeUpsertArgs<ExtArgs>>): Prisma__employeeClient<$Result.GetResult<Prisma.$employeePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {employeeCountArgs} args - Arguments to filter Employees to count.
     * @example
     * // Count the number of Employees
     * const count = await prisma.employee.count({
     *   where: {
     *     // ... the filter for the Employees we want to count
     *   }
     * })
    **/
    count<T extends employeeCountArgs>(
      args?: Subset<T, employeeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmployeeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmployeeAggregateArgs>(args: Subset<T, EmployeeAggregateArgs>): Prisma.PrismaPromise<GetEmployeeAggregateType<T>>

    /**
     * Group by Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {employeeGroupByArgs} args - Group by arguments.
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
      T extends employeeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: employeeGroupByArgs['orderBy'] }
        : { orderBy?: employeeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, employeeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmployeeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the employee model
   */
  readonly fields: employeeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for employee.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__employeeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the employee model
   */
  interface employeeFieldRefs {
    readonly employee_id: FieldRef<"employee", 'String'>
    readonly employee_username: FieldRef<"employee", 'String'>
    readonly employee_firstname: FieldRef<"employee", 'String'>
    readonly employee_lastname: FieldRef<"employee", 'String'>
    readonly employee_pin: FieldRef<"employee", 'Decimal'>
    readonly employee_role: FieldRef<"employee", 'String'>
  }
    

  // Custom InputTypes
  /**
   * employee findUnique
   */
  export type employeeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * Filter, which employee to fetch.
     */
    where: employeeWhereUniqueInput
  }

  /**
   * employee findUniqueOrThrow
   */
  export type employeeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * Filter, which employee to fetch.
     */
    where: employeeWhereUniqueInput
  }

  /**
   * employee findFirst
   */
  export type employeeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * Filter, which employee to fetch.
     */
    where?: employeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of employees to fetch.
     */
    orderBy?: employeeOrderByWithRelationInput | employeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for employees.
     */
    cursor?: employeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * employee findFirstOrThrow
   */
  export type employeeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * Filter, which employee to fetch.
     */
    where?: employeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of employees to fetch.
     */
    orderBy?: employeeOrderByWithRelationInput | employeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for employees.
     */
    cursor?: employeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * employee findMany
   */
  export type employeeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * Filter, which employees to fetch.
     */
    where?: employeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of employees to fetch.
     */
    orderBy?: employeeOrderByWithRelationInput | employeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing employees.
     */
    cursor?: employeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` employees.
     */
    skip?: number
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * employee create
   */
  export type employeeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * The data needed to create a employee.
     */
    data?: XOR<employeeCreateInput, employeeUncheckedCreateInput>
  }

  /**
   * employee createMany
   */
  export type employeeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many employees.
     */
    data: employeeCreateManyInput | employeeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * employee createManyAndReturn
   */
  export type employeeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * The data used to create many employees.
     */
    data: employeeCreateManyInput | employeeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * employee update
   */
  export type employeeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * The data needed to update a employee.
     */
    data: XOR<employeeUpdateInput, employeeUncheckedUpdateInput>
    /**
     * Choose, which employee to update.
     */
    where: employeeWhereUniqueInput
  }

  /**
   * employee updateMany
   */
  export type employeeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update employees.
     */
    data: XOR<employeeUpdateManyMutationInput, employeeUncheckedUpdateManyInput>
    /**
     * Filter which employees to update
     */
    where?: employeeWhereInput
    /**
     * Limit how many employees to update.
     */
    limit?: number
  }

  /**
   * employee updateManyAndReturn
   */
  export type employeeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * The data used to update employees.
     */
    data: XOR<employeeUpdateManyMutationInput, employeeUncheckedUpdateManyInput>
    /**
     * Filter which employees to update
     */
    where?: employeeWhereInput
    /**
     * Limit how many employees to update.
     */
    limit?: number
  }

  /**
   * employee upsert
   */
  export type employeeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * The filter to search for the employee to update in case it exists.
     */
    where: employeeWhereUniqueInput
    /**
     * In case the employee found by the `where` argument doesn't exist, create a new employee with this data.
     */
    create: XOR<employeeCreateInput, employeeUncheckedCreateInput>
    /**
     * In case the employee was found with the provided `where` argument, update it with this data.
     */
    update: XOR<employeeUpdateInput, employeeUncheckedUpdateInput>
  }

  /**
   * employee delete
   */
  export type employeeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
    /**
     * Filter which employee to delete.
     */
    where: employeeWhereUniqueInput
  }

  /**
   * employee deleteMany
   */
  export type employeeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which employees to delete
     */
    where?: employeeWhereInput
    /**
     * Limit how many employees to delete.
     */
    limit?: number
  }

  /**
   * employee without action
   */
  export type employeeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the employee
     */
    select?: employeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the employee
     */
    omit?: employeeOmit<ExtArgs> | null
  }


  /**
   * Model ingredient_transactions
   */

  export type AggregateIngredient_transactions = {
    _count: Ingredient_transactionsCountAggregateOutputType | null
    _avg: Ingredient_transactionsAvgAggregateOutputType | null
    _sum: Ingredient_transactionsSumAggregateOutputType | null
    _min: Ingredient_transactionsMinAggregateOutputType | null
    _max: Ingredient_transactionsMaxAggregateOutputType | null
  }

  export type Ingredient_transactionsAvgAggregateOutputType = {
    transaction_id: number | null
    transaction_total_price: Decimal | null
    transaction_quantity: Decimal | null
  }

  export type Ingredient_transactionsSumAggregateOutputType = {
    transaction_id: number | null
    transaction_total_price: Decimal | null
    transaction_quantity: Decimal | null
  }

  export type Ingredient_transactionsMinAggregateOutputType = {
    transaction_id: number | null
    transaction_date: Date | null
    transaction_from_username: string | null
    transaction_type: string | null
    ingredient_name: string | null
    transaction_total_price: Decimal | null
    transaction_quantity: Decimal | null
    transaction_units: string | null
  }

  export type Ingredient_transactionsMaxAggregateOutputType = {
    transaction_id: number | null
    transaction_date: Date | null
    transaction_from_username: string | null
    transaction_type: string | null
    ingredient_name: string | null
    transaction_total_price: Decimal | null
    transaction_quantity: Decimal | null
    transaction_units: string | null
  }

  export type Ingredient_transactionsCountAggregateOutputType = {
    transaction_id: number
    transaction_date: number
    transaction_from_username: number
    transaction_type: number
    ingredient_name: number
    transaction_total_price: number
    transaction_quantity: number
    transaction_units: number
    _all: number
  }


  export type Ingredient_transactionsAvgAggregateInputType = {
    transaction_id?: true
    transaction_total_price?: true
    transaction_quantity?: true
  }

  export type Ingredient_transactionsSumAggregateInputType = {
    transaction_id?: true
    transaction_total_price?: true
    transaction_quantity?: true
  }

  export type Ingredient_transactionsMinAggregateInputType = {
    transaction_id?: true
    transaction_date?: true
    transaction_from_username?: true
    transaction_type?: true
    ingredient_name?: true
    transaction_total_price?: true
    transaction_quantity?: true
    transaction_units?: true
  }

  export type Ingredient_transactionsMaxAggregateInputType = {
    transaction_id?: true
    transaction_date?: true
    transaction_from_username?: true
    transaction_type?: true
    ingredient_name?: true
    transaction_total_price?: true
    transaction_quantity?: true
    transaction_units?: true
  }

  export type Ingredient_transactionsCountAggregateInputType = {
    transaction_id?: true
    transaction_date?: true
    transaction_from_username?: true
    transaction_type?: true
    ingredient_name?: true
    transaction_total_price?: true
    transaction_quantity?: true
    transaction_units?: true
    _all?: true
  }

  export type Ingredient_transactionsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ingredient_transactions to aggregate.
     */
    where?: ingredient_transactionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionsOrderByWithRelationInput | ingredient_transactionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ingredient_transactionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredient_transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredient_transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ingredient_transactions
    **/
    _count?: true | Ingredient_transactionsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ingredient_transactionsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ingredient_transactionsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ingredient_transactionsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ingredient_transactionsMaxAggregateInputType
  }

  export type GetIngredient_transactionsAggregateType<T extends Ingredient_transactionsAggregateArgs> = {
        [P in keyof T & keyof AggregateIngredient_transactions]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngredient_transactions[P]>
      : GetScalarType<T[P], AggregateIngredient_transactions[P]>
  }




  export type ingredient_transactionsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ingredient_transactionsWhereInput
    orderBy?: ingredient_transactionsOrderByWithAggregationInput | ingredient_transactionsOrderByWithAggregationInput[]
    by: Ingredient_transactionsScalarFieldEnum[] | Ingredient_transactionsScalarFieldEnum
    having?: ingredient_transactionsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ingredient_transactionsCountAggregateInputType | true
    _avg?: Ingredient_transactionsAvgAggregateInputType
    _sum?: Ingredient_transactionsSumAggregateInputType
    _min?: Ingredient_transactionsMinAggregateInputType
    _max?: Ingredient_transactionsMaxAggregateInputType
  }

  export type Ingredient_transactionsGroupByOutputType = {
    transaction_id: number
    transaction_date: Date
    transaction_from_username: string
    transaction_type: string | null
    ingredient_name: string
    transaction_total_price: Decimal
    transaction_quantity: Decimal
    transaction_units: string
    _count: Ingredient_transactionsCountAggregateOutputType | null
    _avg: Ingredient_transactionsAvgAggregateOutputType | null
    _sum: Ingredient_transactionsSumAggregateOutputType | null
    _min: Ingredient_transactionsMinAggregateOutputType | null
    _max: Ingredient_transactionsMaxAggregateOutputType | null
  }

  type GetIngredient_transactionsGroupByPayload<T extends ingredient_transactionsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ingredient_transactionsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ingredient_transactionsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ingredient_transactionsGroupByOutputType[P]>
            : GetScalarType<T[P], Ingredient_transactionsGroupByOutputType[P]>
        }
      >
    >


  export type ingredient_transactionsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    transaction_id?: boolean
    transaction_date?: boolean
    transaction_from_username?: boolean
    transaction_type?: boolean
    ingredient_name?: boolean
    transaction_total_price?: boolean
    transaction_quantity?: boolean
    transaction_units?: boolean
  }, ExtArgs["result"]["ingredient_transactions"]>

  export type ingredient_transactionsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    transaction_id?: boolean
    transaction_date?: boolean
    transaction_from_username?: boolean
    transaction_type?: boolean
    ingredient_name?: boolean
    transaction_total_price?: boolean
    transaction_quantity?: boolean
    transaction_units?: boolean
  }, ExtArgs["result"]["ingredient_transactions"]>

  export type ingredient_transactionsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    transaction_id?: boolean
    transaction_date?: boolean
    transaction_from_username?: boolean
    transaction_type?: boolean
    ingredient_name?: boolean
    transaction_total_price?: boolean
    transaction_quantity?: boolean
    transaction_units?: boolean
  }, ExtArgs["result"]["ingredient_transactions"]>

  export type ingredient_transactionsSelectScalar = {
    transaction_id?: boolean
    transaction_date?: boolean
    transaction_from_username?: boolean
    transaction_type?: boolean
    ingredient_name?: boolean
    transaction_total_price?: boolean
    transaction_quantity?: boolean
    transaction_units?: boolean
  }

  export type ingredient_transactionsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"transaction_id" | "transaction_date" | "transaction_from_username" | "transaction_type" | "ingredient_name" | "transaction_total_price" | "transaction_quantity" | "transaction_units", ExtArgs["result"]["ingredient_transactions"]>

  export type $ingredient_transactionsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ingredient_transactions"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      transaction_id: number
      transaction_date: Date
      transaction_from_username: string
      transaction_type: string | null
      ingredient_name: string
      transaction_total_price: Prisma.Decimal
      transaction_quantity: Prisma.Decimal
      transaction_units: string
    }, ExtArgs["result"]["ingredient_transactions"]>
    composites: {}
  }

  type ingredient_transactionsGetPayload<S extends boolean | null | undefined | ingredient_transactionsDefaultArgs> = $Result.GetResult<Prisma.$ingredient_transactionsPayload, S>

  type ingredient_transactionsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ingredient_transactionsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ingredient_transactionsCountAggregateInputType | true
    }

  export interface ingredient_transactionsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ingredient_transactions'], meta: { name: 'ingredient_transactions' } }
    /**
     * Find zero or one Ingredient_transactions that matches the filter.
     * @param {ingredient_transactionsFindUniqueArgs} args - Arguments to find a Ingredient_transactions
     * @example
     * // Get one Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ingredient_transactionsFindUniqueArgs>(args: SelectSubset<T, ingredient_transactionsFindUniqueArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ingredient_transactions that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ingredient_transactionsFindUniqueOrThrowArgs} args - Arguments to find a Ingredient_transactions
     * @example
     * // Get one Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ingredient_transactionsFindUniqueOrThrowArgs>(args: SelectSubset<T, ingredient_transactionsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredient_transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionsFindFirstArgs} args - Arguments to find a Ingredient_transactions
     * @example
     * // Get one Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ingredient_transactionsFindFirstArgs>(args?: SelectSubset<T, ingredient_transactionsFindFirstArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredient_transactions that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionsFindFirstOrThrowArgs} args - Arguments to find a Ingredient_transactions
     * @example
     * // Get one Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ingredient_transactionsFindFirstOrThrowArgs>(args?: SelectSubset<T, ingredient_transactionsFindFirstOrThrowArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ingredient_transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.findMany()
     * 
     * // Get first 10 Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.findMany({ take: 10 })
     * 
     * // Only select the `transaction_id`
     * const ingredient_transactionsWithTransaction_idOnly = await prisma.ingredient_transactions.findMany({ select: { transaction_id: true } })
     * 
     */
    findMany<T extends ingredient_transactionsFindManyArgs>(args?: SelectSubset<T, ingredient_transactionsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ingredient_transactions.
     * @param {ingredient_transactionsCreateArgs} args - Arguments to create a Ingredient_transactions.
     * @example
     * // Create one Ingredient_transactions
     * const Ingredient_transactions = await prisma.ingredient_transactions.create({
     *   data: {
     *     // ... data to create a Ingredient_transactions
     *   }
     * })
     * 
     */
    create<T extends ingredient_transactionsCreateArgs>(args: SelectSubset<T, ingredient_transactionsCreateArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ingredient_transactions.
     * @param {ingredient_transactionsCreateManyArgs} args - Arguments to create many Ingredient_transactions.
     * @example
     * // Create many Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ingredient_transactionsCreateManyArgs>(args?: SelectSubset<T, ingredient_transactionsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ingredient_transactions and returns the data saved in the database.
     * @param {ingredient_transactionsCreateManyAndReturnArgs} args - Arguments to create many Ingredient_transactions.
     * @example
     * // Create many Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ingredient_transactions and only return the `transaction_id`
     * const ingredient_transactionsWithTransaction_idOnly = await prisma.ingredient_transactions.createManyAndReturn({
     *   select: { transaction_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ingredient_transactionsCreateManyAndReturnArgs>(args?: SelectSubset<T, ingredient_transactionsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ingredient_transactions.
     * @param {ingredient_transactionsDeleteArgs} args - Arguments to delete one Ingredient_transactions.
     * @example
     * // Delete one Ingredient_transactions
     * const Ingredient_transactions = await prisma.ingredient_transactions.delete({
     *   where: {
     *     // ... filter to delete one Ingredient_transactions
     *   }
     * })
     * 
     */
    delete<T extends ingredient_transactionsDeleteArgs>(args: SelectSubset<T, ingredient_transactionsDeleteArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ingredient_transactions.
     * @param {ingredient_transactionsUpdateArgs} args - Arguments to update one Ingredient_transactions.
     * @example
     * // Update one Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ingredient_transactionsUpdateArgs>(args: SelectSubset<T, ingredient_transactionsUpdateArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ingredient_transactions.
     * @param {ingredient_transactionsDeleteManyArgs} args - Arguments to filter Ingredient_transactions to delete.
     * @example
     * // Delete a few Ingredient_transactions
     * const { count } = await prisma.ingredient_transactions.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ingredient_transactionsDeleteManyArgs>(args?: SelectSubset<T, ingredient_transactionsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredient_transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ingredient_transactionsUpdateManyArgs>(args: SelectSubset<T, ingredient_transactionsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredient_transactions and returns the data updated in the database.
     * @param {ingredient_transactionsUpdateManyAndReturnArgs} args - Arguments to update many Ingredient_transactions.
     * @example
     * // Update many Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ingredient_transactions and only return the `transaction_id`
     * const ingredient_transactionsWithTransaction_idOnly = await prisma.ingredient_transactions.updateManyAndReturn({
     *   select: { transaction_id: true },
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
    updateManyAndReturn<T extends ingredient_transactionsUpdateManyAndReturnArgs>(args: SelectSubset<T, ingredient_transactionsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ingredient_transactions.
     * @param {ingredient_transactionsUpsertArgs} args - Arguments to update or create a Ingredient_transactions.
     * @example
     * // Update or create a Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transactions.upsert({
     *   create: {
     *     // ... data to create a Ingredient_transactions
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ingredient_transactions we want to update
     *   }
     * })
     */
    upsert<T extends ingredient_transactionsUpsertArgs>(args: SelectSubset<T, ingredient_transactionsUpsertArgs<ExtArgs>>): Prisma__ingredient_transactionsClient<$Result.GetResult<Prisma.$ingredient_transactionsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ingredient_transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionsCountArgs} args - Arguments to filter Ingredient_transactions to count.
     * @example
     * // Count the number of Ingredient_transactions
     * const count = await prisma.ingredient_transactions.count({
     *   where: {
     *     // ... the filter for the Ingredient_transactions we want to count
     *   }
     * })
    **/
    count<T extends ingredient_transactionsCountArgs>(
      args?: Subset<T, ingredient_transactionsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ingredient_transactionsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ingredient_transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ingredient_transactionsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ingredient_transactionsAggregateArgs>(args: Subset<T, Ingredient_transactionsAggregateArgs>): Prisma.PrismaPromise<GetIngredient_transactionsAggregateType<T>>

    /**
     * Group by Ingredient_transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionsGroupByArgs} args - Group by arguments.
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
      T extends ingredient_transactionsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ingredient_transactionsGroupByArgs['orderBy'] }
        : { orderBy?: ingredient_transactionsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ingredient_transactionsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngredient_transactionsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ingredient_transactions model
   */
  readonly fields: ingredient_transactionsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ingredient_transactions.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ingredient_transactionsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ingredient_transactions model
   */
  interface ingredient_transactionsFieldRefs {
    readonly transaction_id: FieldRef<"ingredient_transactions", 'Int'>
    readonly transaction_date: FieldRef<"ingredient_transactions", 'DateTime'>
    readonly transaction_from_username: FieldRef<"ingredient_transactions", 'String'>
    readonly transaction_type: FieldRef<"ingredient_transactions", 'String'>
    readonly ingredient_name: FieldRef<"ingredient_transactions", 'String'>
    readonly transaction_total_price: FieldRef<"ingredient_transactions", 'Decimal'>
    readonly transaction_quantity: FieldRef<"ingredient_transactions", 'Decimal'>
    readonly transaction_units: FieldRef<"ingredient_transactions", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ingredient_transactions findUnique
   */
  export type ingredient_transactionsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transactions to fetch.
     */
    where: ingredient_transactionsWhereUniqueInput
  }

  /**
   * ingredient_transactions findUniqueOrThrow
   */
  export type ingredient_transactionsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transactions to fetch.
     */
    where: ingredient_transactionsWhereUniqueInput
  }

  /**
   * ingredient_transactions findFirst
   */
  export type ingredient_transactionsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transactions to fetch.
     */
    where?: ingredient_transactionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionsOrderByWithRelationInput | ingredient_transactionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ingredient_transactions.
     */
    cursor?: ingredient_transactionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredient_transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredient_transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ingredient_transactions.
     */
    distinct?: Ingredient_transactionsScalarFieldEnum | Ingredient_transactionsScalarFieldEnum[]
  }

  /**
   * ingredient_transactions findFirstOrThrow
   */
  export type ingredient_transactionsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transactions to fetch.
     */
    where?: ingredient_transactionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionsOrderByWithRelationInput | ingredient_transactionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ingredient_transactions.
     */
    cursor?: ingredient_transactionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredient_transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredient_transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ingredient_transactions.
     */
    distinct?: Ingredient_transactionsScalarFieldEnum | Ingredient_transactionsScalarFieldEnum[]
  }

  /**
   * ingredient_transactions findMany
   */
  export type ingredient_transactionsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transactions to fetch.
     */
    where?: ingredient_transactionsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionsOrderByWithRelationInput | ingredient_transactionsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ingredient_transactions.
     */
    cursor?: ingredient_transactionsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredient_transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredient_transactions.
     */
    skip?: number
    distinct?: Ingredient_transactionsScalarFieldEnum | Ingredient_transactionsScalarFieldEnum[]
  }

  /**
   * ingredient_transactions create
   */
  export type ingredient_transactionsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * The data needed to create a ingredient_transactions.
     */
    data: XOR<ingredient_transactionsCreateInput, ingredient_transactionsUncheckedCreateInput>
  }

  /**
   * ingredient_transactions createMany
   */
  export type ingredient_transactionsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ingredient_transactions.
     */
    data: ingredient_transactionsCreateManyInput | ingredient_transactionsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ingredient_transactions createManyAndReturn
   */
  export type ingredient_transactionsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * The data used to create many ingredient_transactions.
     */
    data: ingredient_transactionsCreateManyInput | ingredient_transactionsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ingredient_transactions update
   */
  export type ingredient_transactionsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * The data needed to update a ingredient_transactions.
     */
    data: XOR<ingredient_transactionsUpdateInput, ingredient_transactionsUncheckedUpdateInput>
    /**
     * Choose, which ingredient_transactions to update.
     */
    where: ingredient_transactionsWhereUniqueInput
  }

  /**
   * ingredient_transactions updateMany
   */
  export type ingredient_transactionsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ingredient_transactions.
     */
    data: XOR<ingredient_transactionsUpdateManyMutationInput, ingredient_transactionsUncheckedUpdateManyInput>
    /**
     * Filter which ingredient_transactions to update
     */
    where?: ingredient_transactionsWhereInput
    /**
     * Limit how many ingredient_transactions to update.
     */
    limit?: number
  }

  /**
   * ingredient_transactions updateManyAndReturn
   */
  export type ingredient_transactionsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * The data used to update ingredient_transactions.
     */
    data: XOR<ingredient_transactionsUpdateManyMutationInput, ingredient_transactionsUncheckedUpdateManyInput>
    /**
     * Filter which ingredient_transactions to update
     */
    where?: ingredient_transactionsWhereInput
    /**
     * Limit how many ingredient_transactions to update.
     */
    limit?: number
  }

  /**
   * ingredient_transactions upsert
   */
  export type ingredient_transactionsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * The filter to search for the ingredient_transactions to update in case it exists.
     */
    where: ingredient_transactionsWhereUniqueInput
    /**
     * In case the ingredient_transactions found by the `where` argument doesn't exist, create a new ingredient_transactions with this data.
     */
    create: XOR<ingredient_transactionsCreateInput, ingredient_transactionsUncheckedCreateInput>
    /**
     * In case the ingredient_transactions was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ingredient_transactionsUpdateInput, ingredient_transactionsUncheckedUpdateInput>
  }

  /**
   * ingredient_transactions delete
   */
  export type ingredient_transactionsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
    /**
     * Filter which ingredient_transactions to delete.
     */
    where: ingredient_transactionsWhereUniqueInput
  }

  /**
   * ingredient_transactions deleteMany
   */
  export type ingredient_transactionsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ingredient_transactions to delete
     */
    where?: ingredient_transactionsWhereInput
    /**
     * Limit how many ingredient_transactions to delete.
     */
    limit?: number
  }

  /**
   * ingredient_transactions without action
   */
  export type ingredient_transactionsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transactions
     */
    select?: ingredient_transactionsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transactions
     */
    omit?: ingredient_transactionsOmit<ExtArgs> | null
  }


  /**
   * Model ingredients
   */

  export type AggregateIngredients = {
    _count: IngredientsCountAggregateOutputType | null
    _avg: IngredientsAvgAggregateOutputType | null
    _sum: IngredientsSumAggregateOutputType | null
    _min: IngredientsMinAggregateOutputType | null
    _max: IngredientsMaxAggregateOutputType | null
  }

  export type IngredientsAvgAggregateOutputType = {
    ingredient_id: number | null
    ingredient_total: Decimal | null
    ingredient_total_alert: Decimal | null
    ingredient_price: Decimal | null
    ingredient_price_per_unit: Decimal | null
  }

  export type IngredientsSumAggregateOutputType = {
    ingredient_id: number | null
    ingredient_total: Decimal | null
    ingredient_total_alert: Decimal | null
    ingredient_price: Decimal | null
    ingredient_price_per_unit: Decimal | null
  }

  export type IngredientsMinAggregateOutputType = {
    ingredient_id: number | null
    ingredient_name: string | null
    ingredient_total: Decimal | null
    ingredient_unit: string | null
    ingredient_lastupdate: Date | null
    ingredient_image: string | null
    ingredient_total_alert: Decimal | null
    ingredient_category: string | null
    ingredient_sub_category: string | null
    ingredient_price: Decimal | null
    ingredient_price_per_unit: Decimal | null
  }

  export type IngredientsMaxAggregateOutputType = {
    ingredient_id: number | null
    ingredient_name: string | null
    ingredient_total: Decimal | null
    ingredient_unit: string | null
    ingredient_lastupdate: Date | null
    ingredient_image: string | null
    ingredient_total_alert: Decimal | null
    ingredient_category: string | null
    ingredient_sub_category: string | null
    ingredient_price: Decimal | null
    ingredient_price_per_unit: Decimal | null
  }

  export type IngredientsCountAggregateOutputType = {
    ingredient_id: number
    ingredient_name: number
    ingredient_total: number
    ingredient_unit: number
    ingredient_lastupdate: number
    ingredient_image: number
    ingredient_total_alert: number
    ingredient_category: number
    ingredient_sub_category: number
    ingredient_price: number
    ingredient_price_per_unit: number
    _all: number
  }


  export type IngredientsAvgAggregateInputType = {
    ingredient_id?: true
    ingredient_total?: true
    ingredient_total_alert?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
  }

  export type IngredientsSumAggregateInputType = {
    ingredient_id?: true
    ingredient_total?: true
    ingredient_total_alert?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
  }

  export type IngredientsMinAggregateInputType = {
    ingredient_id?: true
    ingredient_name?: true
    ingredient_total?: true
    ingredient_unit?: true
    ingredient_lastupdate?: true
    ingredient_image?: true
    ingredient_total_alert?: true
    ingredient_category?: true
    ingredient_sub_category?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
  }

  export type IngredientsMaxAggregateInputType = {
    ingredient_id?: true
    ingredient_name?: true
    ingredient_total?: true
    ingredient_unit?: true
    ingredient_lastupdate?: true
    ingredient_image?: true
    ingredient_total_alert?: true
    ingredient_category?: true
    ingredient_sub_category?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
  }

  export type IngredientsCountAggregateInputType = {
    ingredient_id?: true
    ingredient_name?: true
    ingredient_total?: true
    ingredient_unit?: true
    ingredient_lastupdate?: true
    ingredient_image?: true
    ingredient_total_alert?: true
    ingredient_category?: true
    ingredient_sub_category?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
    _all?: true
  }

  export type IngredientsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ingredients to aggregate.
     */
    where?: ingredientsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredients to fetch.
     */
    orderBy?: ingredientsOrderByWithRelationInput | ingredientsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ingredientsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ingredients
    **/
    _count?: true | IngredientsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IngredientsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IngredientsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IngredientsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IngredientsMaxAggregateInputType
  }

  export type GetIngredientsAggregateType<T extends IngredientsAggregateArgs> = {
        [P in keyof T & keyof AggregateIngredients]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngredients[P]>
      : GetScalarType<T[P], AggregateIngredients[P]>
  }




  export type ingredientsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ingredientsWhereInput
    orderBy?: ingredientsOrderByWithAggregationInput | ingredientsOrderByWithAggregationInput[]
    by: IngredientsScalarFieldEnum[] | IngredientsScalarFieldEnum
    having?: ingredientsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IngredientsCountAggregateInputType | true
    _avg?: IngredientsAvgAggregateInputType
    _sum?: IngredientsSumAggregateInputType
    _min?: IngredientsMinAggregateInputType
    _max?: IngredientsMaxAggregateInputType
  }

  export type IngredientsGroupByOutputType = {
    ingredient_id: number
    ingredient_name: string
    ingredient_total: Decimal | null
    ingredient_unit: string
    ingredient_lastupdate: Date | null
    ingredient_image: string | null
    ingredient_total_alert: Decimal | null
    ingredient_category: string | null
    ingredient_sub_category: string | null
    ingredient_price: Decimal | null
    ingredient_price_per_unit: Decimal | null
    _count: IngredientsCountAggregateOutputType | null
    _avg: IngredientsAvgAggregateOutputType | null
    _sum: IngredientsSumAggregateOutputType | null
    _min: IngredientsMinAggregateOutputType | null
    _max: IngredientsMaxAggregateOutputType | null
  }

  type GetIngredientsGroupByPayload<T extends ingredientsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IngredientsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IngredientsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IngredientsGroupByOutputType[P]>
            : GetScalarType<T[P], IngredientsGroupByOutputType[P]>
        }
      >
    >


  export type ingredientsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ingredient_id?: boolean
    ingredient_name?: boolean
    ingredient_total?: boolean
    ingredient_unit?: boolean
    ingredient_lastupdate?: boolean
    ingredient_image?: boolean
    ingredient_total_alert?: boolean
    ingredient_category?: boolean
    ingredient_sub_category?: boolean
    ingredient_price?: boolean
    ingredient_price_per_unit?: boolean
  }, ExtArgs["result"]["ingredients"]>

  export type ingredientsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ingredient_id?: boolean
    ingredient_name?: boolean
    ingredient_total?: boolean
    ingredient_unit?: boolean
    ingredient_lastupdate?: boolean
    ingredient_image?: boolean
    ingredient_total_alert?: boolean
    ingredient_category?: boolean
    ingredient_sub_category?: boolean
    ingredient_price?: boolean
    ingredient_price_per_unit?: boolean
  }, ExtArgs["result"]["ingredients"]>

  export type ingredientsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ingredient_id?: boolean
    ingredient_name?: boolean
    ingredient_total?: boolean
    ingredient_unit?: boolean
    ingredient_lastupdate?: boolean
    ingredient_image?: boolean
    ingredient_total_alert?: boolean
    ingredient_category?: boolean
    ingredient_sub_category?: boolean
    ingredient_price?: boolean
    ingredient_price_per_unit?: boolean
  }, ExtArgs["result"]["ingredients"]>

  export type ingredientsSelectScalar = {
    ingredient_id?: boolean
    ingredient_name?: boolean
    ingredient_total?: boolean
    ingredient_unit?: boolean
    ingredient_lastupdate?: boolean
    ingredient_image?: boolean
    ingredient_total_alert?: boolean
    ingredient_category?: boolean
    ingredient_sub_category?: boolean
    ingredient_price?: boolean
    ingredient_price_per_unit?: boolean
  }

  export type ingredientsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ingredient_id" | "ingredient_name" | "ingredient_total" | "ingredient_unit" | "ingredient_lastupdate" | "ingredient_image" | "ingredient_total_alert" | "ingredient_category" | "ingredient_sub_category" | "ingredient_price" | "ingredient_price_per_unit", ExtArgs["result"]["ingredients"]>

  export type $ingredientsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ingredients"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      ingredient_id: number
      ingredient_name: string
      ingredient_total: Prisma.Decimal | null
      ingredient_unit: string
      ingredient_lastupdate: Date | null
      ingredient_image: string | null
      ingredient_total_alert: Prisma.Decimal | null
      ingredient_category: string | null
      ingredient_sub_category: string | null
      ingredient_price: Prisma.Decimal | null
      ingredient_price_per_unit: Prisma.Decimal | null
    }, ExtArgs["result"]["ingredients"]>
    composites: {}
  }

  type ingredientsGetPayload<S extends boolean | null | undefined | ingredientsDefaultArgs> = $Result.GetResult<Prisma.$ingredientsPayload, S>

  type ingredientsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ingredientsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IngredientsCountAggregateInputType | true
    }

  export interface ingredientsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ingredients'], meta: { name: 'ingredients' } }
    /**
     * Find zero or one Ingredients that matches the filter.
     * @param {ingredientsFindUniqueArgs} args - Arguments to find a Ingredients
     * @example
     * // Get one Ingredients
     * const ingredients = await prisma.ingredients.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ingredientsFindUniqueArgs>(args: SelectSubset<T, ingredientsFindUniqueArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ingredients that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ingredientsFindUniqueOrThrowArgs} args - Arguments to find a Ingredients
     * @example
     * // Get one Ingredients
     * const ingredients = await prisma.ingredients.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ingredientsFindUniqueOrThrowArgs>(args: SelectSubset<T, ingredientsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredientsFindFirstArgs} args - Arguments to find a Ingredients
     * @example
     * // Get one Ingredients
     * const ingredients = await prisma.ingredients.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ingredientsFindFirstArgs>(args?: SelectSubset<T, ingredientsFindFirstArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredients that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredientsFindFirstOrThrowArgs} args - Arguments to find a Ingredients
     * @example
     * // Get one Ingredients
     * const ingredients = await prisma.ingredients.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ingredientsFindFirstOrThrowArgs>(args?: SelectSubset<T, ingredientsFindFirstOrThrowArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ingredients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredientsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ingredients
     * const ingredients = await prisma.ingredients.findMany()
     * 
     * // Get first 10 Ingredients
     * const ingredients = await prisma.ingredients.findMany({ take: 10 })
     * 
     * // Only select the `ingredient_id`
     * const ingredientsWithIngredient_idOnly = await prisma.ingredients.findMany({ select: { ingredient_id: true } })
     * 
     */
    findMany<T extends ingredientsFindManyArgs>(args?: SelectSubset<T, ingredientsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ingredients.
     * @param {ingredientsCreateArgs} args - Arguments to create a Ingredients.
     * @example
     * // Create one Ingredients
     * const Ingredients = await prisma.ingredients.create({
     *   data: {
     *     // ... data to create a Ingredients
     *   }
     * })
     * 
     */
    create<T extends ingredientsCreateArgs>(args: SelectSubset<T, ingredientsCreateArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ingredients.
     * @param {ingredientsCreateManyArgs} args - Arguments to create many Ingredients.
     * @example
     * // Create many Ingredients
     * const ingredients = await prisma.ingredients.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ingredientsCreateManyArgs>(args?: SelectSubset<T, ingredientsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ingredients and returns the data saved in the database.
     * @param {ingredientsCreateManyAndReturnArgs} args - Arguments to create many Ingredients.
     * @example
     * // Create many Ingredients
     * const ingredients = await prisma.ingredients.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ingredients and only return the `ingredient_id`
     * const ingredientsWithIngredient_idOnly = await prisma.ingredients.createManyAndReturn({
     *   select: { ingredient_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ingredientsCreateManyAndReturnArgs>(args?: SelectSubset<T, ingredientsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ingredients.
     * @param {ingredientsDeleteArgs} args - Arguments to delete one Ingredients.
     * @example
     * // Delete one Ingredients
     * const Ingredients = await prisma.ingredients.delete({
     *   where: {
     *     // ... filter to delete one Ingredients
     *   }
     * })
     * 
     */
    delete<T extends ingredientsDeleteArgs>(args: SelectSubset<T, ingredientsDeleteArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ingredients.
     * @param {ingredientsUpdateArgs} args - Arguments to update one Ingredients.
     * @example
     * // Update one Ingredients
     * const ingredients = await prisma.ingredients.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ingredientsUpdateArgs>(args: SelectSubset<T, ingredientsUpdateArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ingredients.
     * @param {ingredientsDeleteManyArgs} args - Arguments to filter Ingredients to delete.
     * @example
     * // Delete a few Ingredients
     * const { count } = await prisma.ingredients.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ingredientsDeleteManyArgs>(args?: SelectSubset<T, ingredientsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredientsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ingredients
     * const ingredients = await prisma.ingredients.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ingredientsUpdateManyArgs>(args: SelectSubset<T, ingredientsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredients and returns the data updated in the database.
     * @param {ingredientsUpdateManyAndReturnArgs} args - Arguments to update many Ingredients.
     * @example
     * // Update many Ingredients
     * const ingredients = await prisma.ingredients.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ingredients and only return the `ingredient_id`
     * const ingredientsWithIngredient_idOnly = await prisma.ingredients.updateManyAndReturn({
     *   select: { ingredient_id: true },
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
    updateManyAndReturn<T extends ingredientsUpdateManyAndReturnArgs>(args: SelectSubset<T, ingredientsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ingredients.
     * @param {ingredientsUpsertArgs} args - Arguments to update or create a Ingredients.
     * @example
     * // Update or create a Ingredients
     * const ingredients = await prisma.ingredients.upsert({
     *   create: {
     *     // ... data to create a Ingredients
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ingredients we want to update
     *   }
     * })
     */
    upsert<T extends ingredientsUpsertArgs>(args: SelectSubset<T, ingredientsUpsertArgs<ExtArgs>>): Prisma__ingredientsClient<$Result.GetResult<Prisma.$ingredientsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ingredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredientsCountArgs} args - Arguments to filter Ingredients to count.
     * @example
     * // Count the number of Ingredients
     * const count = await prisma.ingredients.count({
     *   where: {
     *     // ... the filter for the Ingredients we want to count
     *   }
     * })
    **/
    count<T extends ingredientsCountArgs>(
      args?: Subset<T, ingredientsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IngredientsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ingredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IngredientsAggregateArgs>(args: Subset<T, IngredientsAggregateArgs>): Prisma.PrismaPromise<GetIngredientsAggregateType<T>>

    /**
     * Group by Ingredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredientsGroupByArgs} args - Group by arguments.
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
      T extends ingredientsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ingredientsGroupByArgs['orderBy'] }
        : { orderBy?: ingredientsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ingredientsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngredientsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ingredients model
   */
  readonly fields: ingredientsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ingredients.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ingredientsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ingredients model
   */
  interface ingredientsFieldRefs {
    readonly ingredient_id: FieldRef<"ingredients", 'Int'>
    readonly ingredient_name: FieldRef<"ingredients", 'String'>
    readonly ingredient_total: FieldRef<"ingredients", 'Decimal'>
    readonly ingredient_unit: FieldRef<"ingredients", 'String'>
    readonly ingredient_lastupdate: FieldRef<"ingredients", 'DateTime'>
    readonly ingredient_image: FieldRef<"ingredients", 'String'>
    readonly ingredient_total_alert: FieldRef<"ingredients", 'Decimal'>
    readonly ingredient_category: FieldRef<"ingredients", 'String'>
    readonly ingredient_sub_category: FieldRef<"ingredients", 'String'>
    readonly ingredient_price: FieldRef<"ingredients", 'Decimal'>
    readonly ingredient_price_per_unit: FieldRef<"ingredients", 'Decimal'>
  }
    

  // Custom InputTypes
  /**
   * ingredients findUnique
   */
  export type ingredientsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * Filter, which ingredients to fetch.
     */
    where: ingredientsWhereUniqueInput
  }

  /**
   * ingredients findUniqueOrThrow
   */
  export type ingredientsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * Filter, which ingredients to fetch.
     */
    where: ingredientsWhereUniqueInput
  }

  /**
   * ingredients findFirst
   */
  export type ingredientsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * Filter, which ingredients to fetch.
     */
    where?: ingredientsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredients to fetch.
     */
    orderBy?: ingredientsOrderByWithRelationInput | ingredientsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ingredients.
     */
    cursor?: ingredientsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ingredients.
     */
    distinct?: IngredientsScalarFieldEnum | IngredientsScalarFieldEnum[]
  }

  /**
   * ingredients findFirstOrThrow
   */
  export type ingredientsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * Filter, which ingredients to fetch.
     */
    where?: ingredientsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredients to fetch.
     */
    orderBy?: ingredientsOrderByWithRelationInput | ingredientsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ingredients.
     */
    cursor?: ingredientsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ingredients.
     */
    distinct?: IngredientsScalarFieldEnum | IngredientsScalarFieldEnum[]
  }

  /**
   * ingredients findMany
   */
  export type ingredientsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * Filter, which ingredients to fetch.
     */
    where?: ingredientsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredients to fetch.
     */
    orderBy?: ingredientsOrderByWithRelationInput | ingredientsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ingredients.
     */
    cursor?: ingredientsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ingredients.
     */
    skip?: number
    distinct?: IngredientsScalarFieldEnum | IngredientsScalarFieldEnum[]
  }

  /**
   * ingredients create
   */
  export type ingredientsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * The data needed to create a ingredients.
     */
    data: XOR<ingredientsCreateInput, ingredientsUncheckedCreateInput>
  }

  /**
   * ingredients createMany
   */
  export type ingredientsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ingredients.
     */
    data: ingredientsCreateManyInput | ingredientsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ingredients createManyAndReturn
   */
  export type ingredientsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * The data used to create many ingredients.
     */
    data: ingredientsCreateManyInput | ingredientsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ingredients update
   */
  export type ingredientsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * The data needed to update a ingredients.
     */
    data: XOR<ingredientsUpdateInput, ingredientsUncheckedUpdateInput>
    /**
     * Choose, which ingredients to update.
     */
    where: ingredientsWhereUniqueInput
  }

  /**
   * ingredients updateMany
   */
  export type ingredientsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ingredients.
     */
    data: XOR<ingredientsUpdateManyMutationInput, ingredientsUncheckedUpdateManyInput>
    /**
     * Filter which ingredients to update
     */
    where?: ingredientsWhereInput
    /**
     * Limit how many ingredients to update.
     */
    limit?: number
  }

  /**
   * ingredients updateManyAndReturn
   */
  export type ingredientsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * The data used to update ingredients.
     */
    data: XOR<ingredientsUpdateManyMutationInput, ingredientsUncheckedUpdateManyInput>
    /**
     * Filter which ingredients to update
     */
    where?: ingredientsWhereInput
    /**
     * Limit how many ingredients to update.
     */
    limit?: number
  }

  /**
   * ingredients upsert
   */
  export type ingredientsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * The filter to search for the ingredients to update in case it exists.
     */
    where: ingredientsWhereUniqueInput
    /**
     * In case the ingredients found by the `where` argument doesn't exist, create a new ingredients with this data.
     */
    create: XOR<ingredientsCreateInput, ingredientsUncheckedCreateInput>
    /**
     * In case the ingredients was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ingredientsUpdateInput, ingredientsUncheckedUpdateInput>
  }

  /**
   * ingredients delete
   */
  export type ingredientsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
    /**
     * Filter which ingredients to delete.
     */
    where: ingredientsWhereUniqueInput
  }

  /**
   * ingredients deleteMany
   */
  export type ingredientsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ingredients to delete
     */
    where?: ingredientsWhereInput
    /**
     * Limit how many ingredients to delete.
     */
    limit?: number
  }

  /**
   * ingredients without action
   */
  export type ingredientsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredients
     */
    select?: ingredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredients
     */
    omit?: ingredientsOmit<ExtArgs> | null
  }


  /**
   * Model menu
   */

  export type AggregateMenu = {
    _count: MenuCountAggregateOutputType | null
    _avg: MenuAvgAggregateOutputType | null
    _sum: MenuSumAggregateOutputType | null
    _min: MenuMinAggregateOutputType | null
    _max: MenuMaxAggregateOutputType | null
  }

  export type MenuAvgAggregateOutputType = {
    menu_id: number | null
    menu_total: Decimal | null
  }

  export type MenuSumAggregateOutputType = {
    menu_id: number | null
    menu_total: Decimal | null
  }

  export type MenuMinAggregateOutputType = {
    menu_id: number | null
    menu_name: string | null
    menu_total: Decimal | null
    menu_image: string | null
    menu_subname: string | null
    menu_catagory: string | null
  }

  export type MenuMaxAggregateOutputType = {
    menu_id: number | null
    menu_name: string | null
    menu_total: Decimal | null
    menu_image: string | null
    menu_subname: string | null
    menu_catagory: string | null
  }

  export type MenuCountAggregateOutputType = {
    menu_id: number
    menu_name: number
    menu_ingredients: number
    menu_total: number
    menu_image: number
    menu_subname: number
    menu_catagory: number
    _all: number
  }


  export type MenuAvgAggregateInputType = {
    menu_id?: true
    menu_total?: true
  }

  export type MenuSumAggregateInputType = {
    menu_id?: true
    menu_total?: true
  }

  export type MenuMinAggregateInputType = {
    menu_id?: true
    menu_name?: true
    menu_total?: true
    menu_image?: true
    menu_subname?: true
    menu_catagory?: true
  }

  export type MenuMaxAggregateInputType = {
    menu_id?: true
    menu_name?: true
    menu_total?: true
    menu_image?: true
    menu_subname?: true
    menu_catagory?: true
  }

  export type MenuCountAggregateInputType = {
    menu_id?: true
    menu_name?: true
    menu_ingredients?: true
    menu_total?: true
    menu_image?: true
    menu_subname?: true
    menu_catagory?: true
    _all?: true
  }

  export type MenuAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which menu to aggregate.
     */
    where?: menuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of menus to fetch.
     */
    orderBy?: menuOrderByWithRelationInput | menuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: menuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` menus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned menus
    **/
    _count?: true | MenuCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MenuAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MenuSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MenuMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MenuMaxAggregateInputType
  }

  export type GetMenuAggregateType<T extends MenuAggregateArgs> = {
        [P in keyof T & keyof AggregateMenu]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMenu[P]>
      : GetScalarType<T[P], AggregateMenu[P]>
  }




  export type menuGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: menuWhereInput
    orderBy?: menuOrderByWithAggregationInput | menuOrderByWithAggregationInput[]
    by: MenuScalarFieldEnum[] | MenuScalarFieldEnum
    having?: menuScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MenuCountAggregateInputType | true
    _avg?: MenuAvgAggregateInputType
    _sum?: MenuSumAggregateInputType
    _min?: MenuMinAggregateInputType
    _max?: MenuMaxAggregateInputType
  }

  export type MenuGroupByOutputType = {
    menu_id: number
    menu_name: string
    menu_ingredients: JsonValue
    menu_total: Decimal | null
    menu_image: string | null
    menu_subname: string | null
    menu_catagory: string | null
    _count: MenuCountAggregateOutputType | null
    _avg: MenuAvgAggregateOutputType | null
    _sum: MenuSumAggregateOutputType | null
    _min: MenuMinAggregateOutputType | null
    _max: MenuMaxAggregateOutputType | null
  }

  type GetMenuGroupByPayload<T extends menuGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MenuGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MenuGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MenuGroupByOutputType[P]>
            : GetScalarType<T[P], MenuGroupByOutputType[P]>
        }
      >
    >


  export type menuSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    menu_id?: boolean
    menu_name?: boolean
    menu_ingredients?: boolean
    menu_total?: boolean
    menu_image?: boolean
    menu_subname?: boolean
    menu_catagory?: boolean
  }, ExtArgs["result"]["menu"]>

  export type menuSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    menu_id?: boolean
    menu_name?: boolean
    menu_ingredients?: boolean
    menu_total?: boolean
    menu_image?: boolean
    menu_subname?: boolean
    menu_catagory?: boolean
  }, ExtArgs["result"]["menu"]>

  export type menuSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    menu_id?: boolean
    menu_name?: boolean
    menu_ingredients?: boolean
    menu_total?: boolean
    menu_image?: boolean
    menu_subname?: boolean
    menu_catagory?: boolean
  }, ExtArgs["result"]["menu"]>

  export type menuSelectScalar = {
    menu_id?: boolean
    menu_name?: boolean
    menu_ingredients?: boolean
    menu_total?: boolean
    menu_image?: boolean
    menu_subname?: boolean
    menu_catagory?: boolean
  }

  export type menuOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"menu_id" | "menu_name" | "menu_ingredients" | "menu_total" | "menu_image" | "menu_subname" | "menu_catagory", ExtArgs["result"]["menu"]>

  export type $menuPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "menu"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      menu_id: number
      menu_name: string
      menu_ingredients: Prisma.JsonValue
      menu_total: Prisma.Decimal | null
      menu_image: string | null
      menu_subname: string | null
      menu_catagory: string | null
    }, ExtArgs["result"]["menu"]>
    composites: {}
  }

  type menuGetPayload<S extends boolean | null | undefined | menuDefaultArgs> = $Result.GetResult<Prisma.$menuPayload, S>

  type menuCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<menuFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MenuCountAggregateInputType | true
    }

  export interface menuDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['menu'], meta: { name: 'menu' } }
    /**
     * Find zero or one Menu that matches the filter.
     * @param {menuFindUniqueArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends menuFindUniqueArgs>(args: SelectSubset<T, menuFindUniqueArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Menu that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {menuFindUniqueOrThrowArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends menuFindUniqueOrThrowArgs>(args: SelectSubset<T, menuFindUniqueOrThrowArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Menu that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {menuFindFirstArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends menuFindFirstArgs>(args?: SelectSubset<T, menuFindFirstArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Menu that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {menuFindFirstOrThrowArgs} args - Arguments to find a Menu
     * @example
     * // Get one Menu
     * const menu = await prisma.menu.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends menuFindFirstOrThrowArgs>(args?: SelectSubset<T, menuFindFirstOrThrowArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Menus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {menuFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Menus
     * const menus = await prisma.menu.findMany()
     * 
     * // Get first 10 Menus
     * const menus = await prisma.menu.findMany({ take: 10 })
     * 
     * // Only select the `menu_id`
     * const menuWithMenu_idOnly = await prisma.menu.findMany({ select: { menu_id: true } })
     * 
     */
    findMany<T extends menuFindManyArgs>(args?: SelectSubset<T, menuFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Menu.
     * @param {menuCreateArgs} args - Arguments to create a Menu.
     * @example
     * // Create one Menu
     * const Menu = await prisma.menu.create({
     *   data: {
     *     // ... data to create a Menu
     *   }
     * })
     * 
     */
    create<T extends menuCreateArgs>(args: SelectSubset<T, menuCreateArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Menus.
     * @param {menuCreateManyArgs} args - Arguments to create many Menus.
     * @example
     * // Create many Menus
     * const menu = await prisma.menu.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends menuCreateManyArgs>(args?: SelectSubset<T, menuCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Menus and returns the data saved in the database.
     * @param {menuCreateManyAndReturnArgs} args - Arguments to create many Menus.
     * @example
     * // Create many Menus
     * const menu = await prisma.menu.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Menus and only return the `menu_id`
     * const menuWithMenu_idOnly = await prisma.menu.createManyAndReturn({
     *   select: { menu_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends menuCreateManyAndReturnArgs>(args?: SelectSubset<T, menuCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Menu.
     * @param {menuDeleteArgs} args - Arguments to delete one Menu.
     * @example
     * // Delete one Menu
     * const Menu = await prisma.menu.delete({
     *   where: {
     *     // ... filter to delete one Menu
     *   }
     * })
     * 
     */
    delete<T extends menuDeleteArgs>(args: SelectSubset<T, menuDeleteArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Menu.
     * @param {menuUpdateArgs} args - Arguments to update one Menu.
     * @example
     * // Update one Menu
     * const menu = await prisma.menu.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends menuUpdateArgs>(args: SelectSubset<T, menuUpdateArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Menus.
     * @param {menuDeleteManyArgs} args - Arguments to filter Menus to delete.
     * @example
     * // Delete a few Menus
     * const { count } = await prisma.menu.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends menuDeleteManyArgs>(args?: SelectSubset<T, menuDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Menus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {menuUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Menus
     * const menu = await prisma.menu.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends menuUpdateManyArgs>(args: SelectSubset<T, menuUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Menus and returns the data updated in the database.
     * @param {menuUpdateManyAndReturnArgs} args - Arguments to update many Menus.
     * @example
     * // Update many Menus
     * const menu = await prisma.menu.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Menus and only return the `menu_id`
     * const menuWithMenu_idOnly = await prisma.menu.updateManyAndReturn({
     *   select: { menu_id: true },
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
    updateManyAndReturn<T extends menuUpdateManyAndReturnArgs>(args: SelectSubset<T, menuUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Menu.
     * @param {menuUpsertArgs} args - Arguments to update or create a Menu.
     * @example
     * // Update or create a Menu
     * const menu = await prisma.menu.upsert({
     *   create: {
     *     // ... data to create a Menu
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Menu we want to update
     *   }
     * })
     */
    upsert<T extends menuUpsertArgs>(args: SelectSubset<T, menuUpsertArgs<ExtArgs>>): Prisma__menuClient<$Result.GetResult<Prisma.$menuPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Menus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {menuCountArgs} args - Arguments to filter Menus to count.
     * @example
     * // Count the number of Menus
     * const count = await prisma.menu.count({
     *   where: {
     *     // ... the filter for the Menus we want to count
     *   }
     * })
    **/
    count<T extends menuCountArgs>(
      args?: Subset<T, menuCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MenuCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Menu.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MenuAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MenuAggregateArgs>(args: Subset<T, MenuAggregateArgs>): Prisma.PrismaPromise<GetMenuAggregateType<T>>

    /**
     * Group by Menu.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {menuGroupByArgs} args - Group by arguments.
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
      T extends menuGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: menuGroupByArgs['orderBy'] }
        : { orderBy?: menuGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, menuGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMenuGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the menu model
   */
  readonly fields: menuFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for menu.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__menuClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the menu model
   */
  interface menuFieldRefs {
    readonly menu_id: FieldRef<"menu", 'Int'>
    readonly menu_name: FieldRef<"menu", 'String'>
    readonly menu_ingredients: FieldRef<"menu", 'Json'>
    readonly menu_total: FieldRef<"menu", 'Decimal'>
    readonly menu_image: FieldRef<"menu", 'String'>
    readonly menu_subname: FieldRef<"menu", 'String'>
    readonly menu_catagory: FieldRef<"menu", 'String'>
  }
    

  // Custom InputTypes
  /**
   * menu findUnique
   */
  export type menuFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * Filter, which menu to fetch.
     */
    where: menuWhereUniqueInput
  }

  /**
   * menu findUniqueOrThrow
   */
  export type menuFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * Filter, which menu to fetch.
     */
    where: menuWhereUniqueInput
  }

  /**
   * menu findFirst
   */
  export type menuFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * Filter, which menu to fetch.
     */
    where?: menuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of menus to fetch.
     */
    orderBy?: menuOrderByWithRelationInput | menuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for menus.
     */
    cursor?: menuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` menus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of menus.
     */
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * menu findFirstOrThrow
   */
  export type menuFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * Filter, which menu to fetch.
     */
    where?: menuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of menus to fetch.
     */
    orderBy?: menuOrderByWithRelationInput | menuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for menus.
     */
    cursor?: menuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` menus.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of menus.
     */
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * menu findMany
   */
  export type menuFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * Filter, which menus to fetch.
     */
    where?: menuWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of menus to fetch.
     */
    orderBy?: menuOrderByWithRelationInput | menuOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing menus.
     */
    cursor?: menuWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` menus from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` menus.
     */
    skip?: number
    distinct?: MenuScalarFieldEnum | MenuScalarFieldEnum[]
  }

  /**
   * menu create
   */
  export type menuCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * The data needed to create a menu.
     */
    data: XOR<menuCreateInput, menuUncheckedCreateInput>
  }

  /**
   * menu createMany
   */
  export type menuCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many menus.
     */
    data: menuCreateManyInput | menuCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * menu createManyAndReturn
   */
  export type menuCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * The data used to create many menus.
     */
    data: menuCreateManyInput | menuCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * menu update
   */
  export type menuUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * The data needed to update a menu.
     */
    data: XOR<menuUpdateInput, menuUncheckedUpdateInput>
    /**
     * Choose, which menu to update.
     */
    where: menuWhereUniqueInput
  }

  /**
   * menu updateMany
   */
  export type menuUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update menus.
     */
    data: XOR<menuUpdateManyMutationInput, menuUncheckedUpdateManyInput>
    /**
     * Filter which menus to update
     */
    where?: menuWhereInput
    /**
     * Limit how many menus to update.
     */
    limit?: number
  }

  /**
   * menu updateManyAndReturn
   */
  export type menuUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * The data used to update menus.
     */
    data: XOR<menuUpdateManyMutationInput, menuUncheckedUpdateManyInput>
    /**
     * Filter which menus to update
     */
    where?: menuWhereInput
    /**
     * Limit how many menus to update.
     */
    limit?: number
  }

  /**
   * menu upsert
   */
  export type menuUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * The filter to search for the menu to update in case it exists.
     */
    where: menuWhereUniqueInput
    /**
     * In case the menu found by the `where` argument doesn't exist, create a new menu with this data.
     */
    create: XOR<menuCreateInput, menuUncheckedCreateInput>
    /**
     * In case the menu was found with the provided `where` argument, update it with this data.
     */
    update: XOR<menuUpdateInput, menuUncheckedUpdateInput>
  }

  /**
   * menu delete
   */
  export type menuDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
    /**
     * Filter which menu to delete.
     */
    where: menuWhereUniqueInput
  }

  /**
   * menu deleteMany
   */
  export type menuDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which menus to delete
     */
    where?: menuWhereInput
    /**
     * Limit how many menus to delete.
     */
    limit?: number
  }

  /**
   * menu without action
   */
  export type menuDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the menu
     */
    select?: menuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the menu
     */
    omit?: menuOmit<ExtArgs> | null
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


  export const CartScalarFieldEnum: {
    cart_id: 'cart_id',
    cart_username: 'cart_username',
    cart_menu_items: 'cart_menu_items',
    cart_create_date: 'cart_create_date',
    cart_status: 'cart_status',
    cart_order_number: 'cart_order_number',
    cart_last_update: 'cart_last_update',
    cart_customer_name: 'cart_customer_name',
    cart_customer_tel: 'cart_customer_tel',
    cart_location_send: 'cart_location_send',
    cart_delivery_date: 'cart_delivery_date',
    cart_export_time: 'cart_export_time',
    cart_receive_time: 'cart_receive_time'
  };

  export type CartScalarFieldEnum = (typeof CartScalarFieldEnum)[keyof typeof CartScalarFieldEnum]


  export const EmployeeScalarFieldEnum: {
    employee_id: 'employee_id',
    employee_username: 'employee_username',
    employee_firstname: 'employee_firstname',
    employee_lastname: 'employee_lastname',
    employee_pin: 'employee_pin',
    employee_role: 'employee_role'
  };

  export type EmployeeScalarFieldEnum = (typeof EmployeeScalarFieldEnum)[keyof typeof EmployeeScalarFieldEnum]


  export const Ingredient_transactionsScalarFieldEnum: {
    transaction_id: 'transaction_id',
    transaction_date: 'transaction_date',
    transaction_from_username: 'transaction_from_username',
    transaction_type: 'transaction_type',
    ingredient_name: 'ingredient_name',
    transaction_total_price: 'transaction_total_price',
    transaction_quantity: 'transaction_quantity',
    transaction_units: 'transaction_units'
  };

  export type Ingredient_transactionsScalarFieldEnum = (typeof Ingredient_transactionsScalarFieldEnum)[keyof typeof Ingredient_transactionsScalarFieldEnum]


  export const IngredientsScalarFieldEnum: {
    ingredient_id: 'ingredient_id',
    ingredient_name: 'ingredient_name',
    ingredient_total: 'ingredient_total',
    ingredient_unit: 'ingredient_unit',
    ingredient_lastupdate: 'ingredient_lastupdate',
    ingredient_image: 'ingredient_image',
    ingredient_total_alert: 'ingredient_total_alert',
    ingredient_category: 'ingredient_category',
    ingredient_sub_category: 'ingredient_sub_category',
    ingredient_price: 'ingredient_price',
    ingredient_price_per_unit: 'ingredient_price_per_unit'
  };

  export type IngredientsScalarFieldEnum = (typeof IngredientsScalarFieldEnum)[keyof typeof IngredientsScalarFieldEnum]


  export const MenuScalarFieldEnum: {
    menu_id: 'menu_id',
    menu_name: 'menu_name',
    menu_ingredients: 'menu_ingredients',
    menu_total: 'menu_total',
    menu_image: 'menu_image',
    menu_subname: 'menu_subname',
    menu_catagory: 'menu_catagory'
  };

  export type MenuScalarFieldEnum = (typeof MenuScalarFieldEnum)[keyof typeof MenuScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type cartWhereInput = {
    AND?: cartWhereInput | cartWhereInput[]
    OR?: cartWhereInput[]
    NOT?: cartWhereInput | cartWhereInput[]
    cart_id?: UuidFilter<"cart"> | string
    cart_username?: StringFilter<"cart"> | string
    cart_menu_items?: JsonFilter<"cart">
    cart_create_date?: DateTimeNullableFilter<"cart"> | Date | string | null
    cart_status?: StringNullableFilter<"cart"> | string | null
    cart_order_number?: StringNullableFilter<"cart"> | string | null
    cart_last_update?: StringNullableFilter<"cart"> | string | null
    cart_customer_name?: StringNullableFilter<"cart"> | string | null
    cart_customer_tel?: StringNullableFilter<"cart"> | string | null
    cart_location_send?: StringNullableFilter<"cart"> | string | null
    cart_delivery_date?: StringNullableFilter<"cart"> | string | null
    cart_export_time?: StringNullableFilter<"cart"> | string | null
    cart_receive_time?: StringNullableFilter<"cart"> | string | null
  }

  export type cartOrderByWithRelationInput = {
    cart_id?: SortOrder
    cart_username?: SortOrder
    cart_menu_items?: SortOrder
    cart_create_date?: SortOrderInput | SortOrder
    cart_status?: SortOrderInput | SortOrder
    cart_order_number?: SortOrderInput | SortOrder
    cart_last_update?: SortOrderInput | SortOrder
    cart_customer_name?: SortOrderInput | SortOrder
    cart_customer_tel?: SortOrderInput | SortOrder
    cart_location_send?: SortOrderInput | SortOrder
    cart_delivery_date?: SortOrderInput | SortOrder
    cart_export_time?: SortOrderInput | SortOrder
    cart_receive_time?: SortOrderInput | SortOrder
  }

  export type cartWhereUniqueInput = Prisma.AtLeast<{
    cart_id?: string
    AND?: cartWhereInput | cartWhereInput[]
    OR?: cartWhereInput[]
    NOT?: cartWhereInput | cartWhereInput[]
    cart_username?: StringFilter<"cart"> | string
    cart_menu_items?: JsonFilter<"cart">
    cart_create_date?: DateTimeNullableFilter<"cart"> | Date | string | null
    cart_status?: StringNullableFilter<"cart"> | string | null
    cart_order_number?: StringNullableFilter<"cart"> | string | null
    cart_last_update?: StringNullableFilter<"cart"> | string | null
    cart_customer_name?: StringNullableFilter<"cart"> | string | null
    cart_customer_tel?: StringNullableFilter<"cart"> | string | null
    cart_location_send?: StringNullableFilter<"cart"> | string | null
    cart_delivery_date?: StringNullableFilter<"cart"> | string | null
    cart_export_time?: StringNullableFilter<"cart"> | string | null
    cart_receive_time?: StringNullableFilter<"cart"> | string | null
  }, "cart_id">

  export type cartOrderByWithAggregationInput = {
    cart_id?: SortOrder
    cart_username?: SortOrder
    cart_menu_items?: SortOrder
    cart_create_date?: SortOrderInput | SortOrder
    cart_status?: SortOrderInput | SortOrder
    cart_order_number?: SortOrderInput | SortOrder
    cart_last_update?: SortOrderInput | SortOrder
    cart_customer_name?: SortOrderInput | SortOrder
    cart_customer_tel?: SortOrderInput | SortOrder
    cart_location_send?: SortOrderInput | SortOrder
    cart_delivery_date?: SortOrderInput | SortOrder
    cart_export_time?: SortOrderInput | SortOrder
    cart_receive_time?: SortOrderInput | SortOrder
    _count?: cartCountOrderByAggregateInput
    _max?: cartMaxOrderByAggregateInput
    _min?: cartMinOrderByAggregateInput
  }

  export type cartScalarWhereWithAggregatesInput = {
    AND?: cartScalarWhereWithAggregatesInput | cartScalarWhereWithAggregatesInput[]
    OR?: cartScalarWhereWithAggregatesInput[]
    NOT?: cartScalarWhereWithAggregatesInput | cartScalarWhereWithAggregatesInput[]
    cart_id?: UuidWithAggregatesFilter<"cart"> | string
    cart_username?: StringWithAggregatesFilter<"cart"> | string
    cart_menu_items?: JsonWithAggregatesFilter<"cart">
    cart_create_date?: DateTimeNullableWithAggregatesFilter<"cart"> | Date | string | null
    cart_status?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_order_number?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_last_update?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_customer_name?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_customer_tel?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_location_send?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_delivery_date?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_export_time?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_receive_time?: StringNullableWithAggregatesFilter<"cart"> | string | null
  }

  export type employeeWhereInput = {
    AND?: employeeWhereInput | employeeWhereInput[]
    OR?: employeeWhereInput[]
    NOT?: employeeWhereInput | employeeWhereInput[]
    employee_id?: UuidFilter<"employee"> | string
    employee_username?: StringNullableFilter<"employee"> | string | null
    employee_firstname?: StringNullableFilter<"employee"> | string | null
    employee_lastname?: StringNullableFilter<"employee"> | string | null
    employee_pin?: DecimalNullableFilter<"employee"> | Decimal | DecimalJsLike | number | string | null
    employee_role?: StringNullableFilter<"employee"> | string | null
  }

  export type employeeOrderByWithRelationInput = {
    employee_id?: SortOrder
    employee_username?: SortOrderInput | SortOrder
    employee_firstname?: SortOrderInput | SortOrder
    employee_lastname?: SortOrderInput | SortOrder
    employee_pin?: SortOrderInput | SortOrder
    employee_role?: SortOrderInput | SortOrder
  }

  export type employeeWhereUniqueInput = Prisma.AtLeast<{
    employee_id?: string
    AND?: employeeWhereInput | employeeWhereInput[]
    OR?: employeeWhereInput[]
    NOT?: employeeWhereInput | employeeWhereInput[]
    employee_username?: StringNullableFilter<"employee"> | string | null
    employee_firstname?: StringNullableFilter<"employee"> | string | null
    employee_lastname?: StringNullableFilter<"employee"> | string | null
    employee_pin?: DecimalNullableFilter<"employee"> | Decimal | DecimalJsLike | number | string | null
    employee_role?: StringNullableFilter<"employee"> | string | null
  }, "employee_id">

  export type employeeOrderByWithAggregationInput = {
    employee_id?: SortOrder
    employee_username?: SortOrderInput | SortOrder
    employee_firstname?: SortOrderInput | SortOrder
    employee_lastname?: SortOrderInput | SortOrder
    employee_pin?: SortOrderInput | SortOrder
    employee_role?: SortOrderInput | SortOrder
    _count?: employeeCountOrderByAggregateInput
    _avg?: employeeAvgOrderByAggregateInput
    _max?: employeeMaxOrderByAggregateInput
    _min?: employeeMinOrderByAggregateInput
    _sum?: employeeSumOrderByAggregateInput
  }

  export type employeeScalarWhereWithAggregatesInput = {
    AND?: employeeScalarWhereWithAggregatesInput | employeeScalarWhereWithAggregatesInput[]
    OR?: employeeScalarWhereWithAggregatesInput[]
    NOT?: employeeScalarWhereWithAggregatesInput | employeeScalarWhereWithAggregatesInput[]
    employee_id?: UuidWithAggregatesFilter<"employee"> | string
    employee_username?: StringNullableWithAggregatesFilter<"employee"> | string | null
    employee_firstname?: StringNullableWithAggregatesFilter<"employee"> | string | null
    employee_lastname?: StringNullableWithAggregatesFilter<"employee"> | string | null
    employee_pin?: DecimalNullableWithAggregatesFilter<"employee"> | Decimal | DecimalJsLike | number | string | null
    employee_role?: StringNullableWithAggregatesFilter<"employee"> | string | null
  }

  export type ingredient_transactionsWhereInput = {
    AND?: ingredient_transactionsWhereInput | ingredient_transactionsWhereInput[]
    OR?: ingredient_transactionsWhereInput[]
    NOT?: ingredient_transactionsWhereInput | ingredient_transactionsWhereInput[]
    transaction_id?: IntFilter<"ingredient_transactions"> | number
    transaction_date?: DateTimeFilter<"ingredient_transactions"> | Date | string
    transaction_from_username?: StringFilter<"ingredient_transactions"> | string
    transaction_type?: StringNullableFilter<"ingredient_transactions"> | string | null
    ingredient_name?: StringFilter<"ingredient_transactions"> | string
    transaction_total_price?: DecimalFilter<"ingredient_transactions"> | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalFilter<"ingredient_transactions"> | Decimal | DecimalJsLike | number | string
    transaction_units?: StringFilter<"ingredient_transactions"> | string
  }

  export type ingredient_transactionsOrderByWithRelationInput = {
    transaction_id?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_type?: SortOrderInput | SortOrder
    ingredient_name?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionsWhereUniqueInput = Prisma.AtLeast<{
    transaction_id?: number
    AND?: ingredient_transactionsWhereInput | ingredient_transactionsWhereInput[]
    OR?: ingredient_transactionsWhereInput[]
    NOT?: ingredient_transactionsWhereInput | ingredient_transactionsWhereInput[]
    transaction_date?: DateTimeFilter<"ingredient_transactions"> | Date | string
    transaction_from_username?: StringFilter<"ingredient_transactions"> | string
    transaction_type?: StringNullableFilter<"ingredient_transactions"> | string | null
    ingredient_name?: StringFilter<"ingredient_transactions"> | string
    transaction_total_price?: DecimalFilter<"ingredient_transactions"> | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalFilter<"ingredient_transactions"> | Decimal | DecimalJsLike | number | string
    transaction_units?: StringFilter<"ingredient_transactions"> | string
  }, "transaction_id">

  export type ingredient_transactionsOrderByWithAggregationInput = {
    transaction_id?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_type?: SortOrderInput | SortOrder
    ingredient_name?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
    transaction_units?: SortOrder
    _count?: ingredient_transactionsCountOrderByAggregateInput
    _avg?: ingredient_transactionsAvgOrderByAggregateInput
    _max?: ingredient_transactionsMaxOrderByAggregateInput
    _min?: ingredient_transactionsMinOrderByAggregateInput
    _sum?: ingredient_transactionsSumOrderByAggregateInput
  }

  export type ingredient_transactionsScalarWhereWithAggregatesInput = {
    AND?: ingredient_transactionsScalarWhereWithAggregatesInput | ingredient_transactionsScalarWhereWithAggregatesInput[]
    OR?: ingredient_transactionsScalarWhereWithAggregatesInput[]
    NOT?: ingredient_transactionsScalarWhereWithAggregatesInput | ingredient_transactionsScalarWhereWithAggregatesInput[]
    transaction_id?: IntWithAggregatesFilter<"ingredient_transactions"> | number
    transaction_date?: DateTimeWithAggregatesFilter<"ingredient_transactions"> | Date | string
    transaction_from_username?: StringWithAggregatesFilter<"ingredient_transactions"> | string
    transaction_type?: StringNullableWithAggregatesFilter<"ingredient_transactions"> | string | null
    ingredient_name?: StringWithAggregatesFilter<"ingredient_transactions"> | string
    transaction_total_price?: DecimalWithAggregatesFilter<"ingredient_transactions"> | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalWithAggregatesFilter<"ingredient_transactions"> | Decimal | DecimalJsLike | number | string
    transaction_units?: StringWithAggregatesFilter<"ingredient_transactions"> | string
  }

  export type ingredientsWhereInput = {
    AND?: ingredientsWhereInput | ingredientsWhereInput[]
    OR?: ingredientsWhereInput[]
    NOT?: ingredientsWhereInput | ingredientsWhereInput[]
    ingredient_id?: IntFilter<"ingredients"> | number
    ingredient_name?: StringFilter<"ingredients"> | string
    ingredient_total?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringFilter<"ingredients"> | string
    ingredient_lastupdate?: DateTimeNullableFilter<"ingredients"> | Date | string | null
    ingredient_image?: StringNullableFilter<"ingredients"> | string | null
    ingredient_total_alert?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: StringNullableFilter<"ingredients"> | string | null
    ingredient_sub_category?: StringNullableFilter<"ingredients"> | string | null
    ingredient_price?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsOrderByWithRelationInput = {
    ingredient_id?: SortOrder
    ingredient_name?: SortOrder
    ingredient_total?: SortOrderInput | SortOrder
    ingredient_unit?: SortOrder
    ingredient_lastupdate?: SortOrderInput | SortOrder
    ingredient_image?: SortOrderInput | SortOrder
    ingredient_total_alert?: SortOrderInput | SortOrder
    ingredient_category?: SortOrderInput | SortOrder
    ingredient_sub_category?: SortOrderInput | SortOrder
    ingredient_price?: SortOrderInput | SortOrder
    ingredient_price_per_unit?: SortOrderInput | SortOrder
  }

  export type ingredientsWhereUniqueInput = Prisma.AtLeast<{
    ingredient_id?: number
    AND?: ingredientsWhereInput | ingredientsWhereInput[]
    OR?: ingredientsWhereInput[]
    NOT?: ingredientsWhereInput | ingredientsWhereInput[]
    ingredient_name?: StringFilter<"ingredients"> | string
    ingredient_total?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringFilter<"ingredients"> | string
    ingredient_lastupdate?: DateTimeNullableFilter<"ingredients"> | Date | string | null
    ingredient_image?: StringNullableFilter<"ingredients"> | string | null
    ingredient_total_alert?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: StringNullableFilter<"ingredients"> | string | null
    ingredient_sub_category?: StringNullableFilter<"ingredients"> | string | null
    ingredient_price?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: DecimalNullableFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
  }, "ingredient_id">

  export type ingredientsOrderByWithAggregationInput = {
    ingredient_id?: SortOrder
    ingredient_name?: SortOrder
    ingredient_total?: SortOrderInput | SortOrder
    ingredient_unit?: SortOrder
    ingredient_lastupdate?: SortOrderInput | SortOrder
    ingredient_image?: SortOrderInput | SortOrder
    ingredient_total_alert?: SortOrderInput | SortOrder
    ingredient_category?: SortOrderInput | SortOrder
    ingredient_sub_category?: SortOrderInput | SortOrder
    ingredient_price?: SortOrderInput | SortOrder
    ingredient_price_per_unit?: SortOrderInput | SortOrder
    _count?: ingredientsCountOrderByAggregateInput
    _avg?: ingredientsAvgOrderByAggregateInput
    _max?: ingredientsMaxOrderByAggregateInput
    _min?: ingredientsMinOrderByAggregateInput
    _sum?: ingredientsSumOrderByAggregateInput
  }

  export type ingredientsScalarWhereWithAggregatesInput = {
    AND?: ingredientsScalarWhereWithAggregatesInput | ingredientsScalarWhereWithAggregatesInput[]
    OR?: ingredientsScalarWhereWithAggregatesInput[]
    NOT?: ingredientsScalarWhereWithAggregatesInput | ingredientsScalarWhereWithAggregatesInput[]
    ingredient_id?: IntWithAggregatesFilter<"ingredients"> | number
    ingredient_name?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_total?: DecimalNullableWithAggregatesFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_lastupdate?: DateTimeNullableWithAggregatesFilter<"ingredients"> | Date | string | null
    ingredient_image?: StringNullableWithAggregatesFilter<"ingredients"> | string | null
    ingredient_total_alert?: DecimalNullableWithAggregatesFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: StringNullableWithAggregatesFilter<"ingredients"> | string | null
    ingredient_sub_category?: StringNullableWithAggregatesFilter<"ingredients"> | string | null
    ingredient_price?: DecimalNullableWithAggregatesFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: DecimalNullableWithAggregatesFilter<"ingredients"> | Decimal | DecimalJsLike | number | string | null
  }

  export type menuWhereInput = {
    AND?: menuWhereInput | menuWhereInput[]
    OR?: menuWhereInput[]
    NOT?: menuWhereInput | menuWhereInput[]
    menu_id?: IntFilter<"menu"> | number
    menu_name?: StringFilter<"menu"> | string
    menu_ingredients?: JsonFilter<"menu">
    menu_total?: DecimalNullableFilter<"menu"> | Decimal | DecimalJsLike | number | string | null
    menu_image?: StringNullableFilter<"menu"> | string | null
    menu_subname?: StringNullableFilter<"menu"> | string | null
    menu_catagory?: StringNullableFilter<"menu"> | string | null
  }

  export type menuOrderByWithRelationInput = {
    menu_id?: SortOrder
    menu_name?: SortOrder
    menu_ingredients?: SortOrder
    menu_total?: SortOrderInput | SortOrder
    menu_image?: SortOrderInput | SortOrder
    menu_subname?: SortOrderInput | SortOrder
    menu_catagory?: SortOrderInput | SortOrder
  }

  export type menuWhereUniqueInput = Prisma.AtLeast<{
    menu_id?: number
    AND?: menuWhereInput | menuWhereInput[]
    OR?: menuWhereInput[]
    NOT?: menuWhereInput | menuWhereInput[]
    menu_name?: StringFilter<"menu"> | string
    menu_ingredients?: JsonFilter<"menu">
    menu_total?: DecimalNullableFilter<"menu"> | Decimal | DecimalJsLike | number | string | null
    menu_image?: StringNullableFilter<"menu"> | string | null
    menu_subname?: StringNullableFilter<"menu"> | string | null
    menu_catagory?: StringNullableFilter<"menu"> | string | null
  }, "menu_id">

  export type menuOrderByWithAggregationInput = {
    menu_id?: SortOrder
    menu_name?: SortOrder
    menu_ingredients?: SortOrder
    menu_total?: SortOrderInput | SortOrder
    menu_image?: SortOrderInput | SortOrder
    menu_subname?: SortOrderInput | SortOrder
    menu_catagory?: SortOrderInput | SortOrder
    _count?: menuCountOrderByAggregateInput
    _avg?: menuAvgOrderByAggregateInput
    _max?: menuMaxOrderByAggregateInput
    _min?: menuMinOrderByAggregateInput
    _sum?: menuSumOrderByAggregateInput
  }

  export type menuScalarWhereWithAggregatesInput = {
    AND?: menuScalarWhereWithAggregatesInput | menuScalarWhereWithAggregatesInput[]
    OR?: menuScalarWhereWithAggregatesInput[]
    NOT?: menuScalarWhereWithAggregatesInput | menuScalarWhereWithAggregatesInput[]
    menu_id?: IntWithAggregatesFilter<"menu"> | number
    menu_name?: StringWithAggregatesFilter<"menu"> | string
    menu_ingredients?: JsonWithAggregatesFilter<"menu">
    menu_total?: DecimalNullableWithAggregatesFilter<"menu"> | Decimal | DecimalJsLike | number | string | null
    menu_image?: StringNullableWithAggregatesFilter<"menu"> | string | null
    menu_subname?: StringNullableWithAggregatesFilter<"menu"> | string | null
    menu_catagory?: StringNullableWithAggregatesFilter<"menu"> | string | null
  }

  export type cartCreateInput = {
    cart_id?: string
    cart_username: string
    cart_menu_items: JsonNullValueInput | InputJsonValue
    cart_create_date?: Date | string | null
    cart_status?: string | null
    cart_order_number?: string | null
    cart_last_update?: string | null
    cart_customer_name?: string | null
    cart_customer_tel?: string | null
    cart_location_send?: string | null
    cart_delivery_date?: string | null
    cart_export_time?: string | null
    cart_receive_time?: string | null
  }

  export type cartUncheckedCreateInput = {
    cart_id?: string
    cart_username: string
    cart_menu_items: JsonNullValueInput | InputJsonValue
    cart_create_date?: Date | string | null
    cart_status?: string | null
    cart_order_number?: string | null
    cart_last_update?: string | null
    cart_customer_name?: string | null
    cart_customer_tel?: string | null
    cart_location_send?: string | null
    cart_delivery_date?: string | null
    cart_export_time?: string | null
    cart_receive_time?: string | null
  }

  export type cartUpdateInput = {
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
    cart_menu_items?: JsonNullValueInput | InputJsonValue
    cart_create_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cart_status?: NullableStringFieldUpdateOperationsInput | string | null
    cart_order_number?: NullableStringFieldUpdateOperationsInput | string | null
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_name?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_tel?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: NullableStringFieldUpdateOperationsInput | string | null
    cart_delivery_date?: NullableStringFieldUpdateOperationsInput | string | null
    cart_export_time?: NullableStringFieldUpdateOperationsInput | string | null
    cart_receive_time?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type cartUncheckedUpdateInput = {
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
    cart_menu_items?: JsonNullValueInput | InputJsonValue
    cart_create_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cart_status?: NullableStringFieldUpdateOperationsInput | string | null
    cart_order_number?: NullableStringFieldUpdateOperationsInput | string | null
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_name?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_tel?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: NullableStringFieldUpdateOperationsInput | string | null
    cart_delivery_date?: NullableStringFieldUpdateOperationsInput | string | null
    cart_export_time?: NullableStringFieldUpdateOperationsInput | string | null
    cart_receive_time?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type cartCreateManyInput = {
    cart_id?: string
    cart_username: string
    cart_menu_items: JsonNullValueInput | InputJsonValue
    cart_create_date?: Date | string | null
    cart_status?: string | null
    cart_order_number?: string | null
    cart_last_update?: string | null
    cart_customer_name?: string | null
    cart_customer_tel?: string | null
    cart_location_send?: string | null
    cart_delivery_date?: string | null
    cart_export_time?: string | null
    cart_receive_time?: string | null
  }

  export type cartUpdateManyMutationInput = {
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
    cart_menu_items?: JsonNullValueInput | InputJsonValue
    cart_create_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cart_status?: NullableStringFieldUpdateOperationsInput | string | null
    cart_order_number?: NullableStringFieldUpdateOperationsInput | string | null
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_name?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_tel?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: NullableStringFieldUpdateOperationsInput | string | null
    cart_delivery_date?: NullableStringFieldUpdateOperationsInput | string | null
    cart_export_time?: NullableStringFieldUpdateOperationsInput | string | null
    cart_receive_time?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type cartUncheckedUpdateManyInput = {
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
    cart_menu_items?: JsonNullValueInput | InputJsonValue
    cart_create_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cart_status?: NullableStringFieldUpdateOperationsInput | string | null
    cart_order_number?: NullableStringFieldUpdateOperationsInput | string | null
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_name?: NullableStringFieldUpdateOperationsInput | string | null
    cart_customer_tel?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: NullableStringFieldUpdateOperationsInput | string | null
    cart_delivery_date?: NullableStringFieldUpdateOperationsInput | string | null
    cart_export_time?: NullableStringFieldUpdateOperationsInput | string | null
    cart_receive_time?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type employeeCreateInput = {
    employee_id?: string
    employee_username?: string | null
    employee_firstname?: string | null
    employee_lastname?: string | null
    employee_pin?: Decimal | DecimalJsLike | number | string | null
    employee_role?: string | null
  }

  export type employeeUncheckedCreateInput = {
    employee_id?: string
    employee_username?: string | null
    employee_firstname?: string | null
    employee_lastname?: string | null
    employee_pin?: Decimal | DecimalJsLike | number | string | null
    employee_role?: string | null
  }

  export type employeeUpdateInput = {
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_username?: NullableStringFieldUpdateOperationsInput | string | null
    employee_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_lastname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_pin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    employee_role?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type employeeUncheckedUpdateInput = {
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_username?: NullableStringFieldUpdateOperationsInput | string | null
    employee_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_lastname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_pin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    employee_role?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type employeeCreateManyInput = {
    employee_id?: string
    employee_username?: string | null
    employee_firstname?: string | null
    employee_lastname?: string | null
    employee_pin?: Decimal | DecimalJsLike | number | string | null
    employee_role?: string | null
  }

  export type employeeUpdateManyMutationInput = {
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_username?: NullableStringFieldUpdateOperationsInput | string | null
    employee_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_lastname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_pin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    employee_role?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type employeeUncheckedUpdateManyInput = {
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_username?: NullableStringFieldUpdateOperationsInput | string | null
    employee_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_lastname?: NullableStringFieldUpdateOperationsInput | string | null
    employee_pin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    employee_role?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ingredient_transactionsCreateInput = {
    transaction_date?: Date | string
    transaction_from_username: string
    transaction_type?: string | null
    ingredient_name: string
    transaction_total_price: Decimal | DecimalJsLike | number | string
    transaction_quantity: Decimal | DecimalJsLike | number | string
    transaction_units: string
  }

  export type ingredient_transactionsUncheckedCreateInput = {
    transaction_id?: number
    transaction_date?: Date | string
    transaction_from_username: string
    transaction_type?: string | null
    ingredient_name: string
    transaction_total_price: Decimal | DecimalJsLike | number | string
    transaction_quantity: Decimal | DecimalJsLike | number | string
    transaction_units: string
  }

  export type ingredient_transactionsUpdateInput = {
    transaction_date?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_type?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionsUncheckedUpdateInput = {
    transaction_id?: IntFieldUpdateOperationsInput | number
    transaction_date?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_type?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionsCreateManyInput = {
    transaction_id?: number
    transaction_date?: Date | string
    transaction_from_username: string
    transaction_type?: string | null
    ingredient_name: string
    transaction_total_price: Decimal | DecimalJsLike | number | string
    transaction_quantity: Decimal | DecimalJsLike | number | string
    transaction_units: string
  }

  export type ingredient_transactionsUpdateManyMutationInput = {
    transaction_date?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_type?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionsUncheckedUpdateManyInput = {
    transaction_id?: IntFieldUpdateOperationsInput | number
    transaction_date?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_type?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredientsCreateInput = {
    ingredient_name: string
    ingredient_total?: Decimal | DecimalJsLike | number | string | null
    ingredient_unit: string
    ingredient_lastupdate?: Date | string | null
    ingredient_image?: string | null
    ingredient_total_alert?: Decimal | DecimalJsLike | number | string | null
    ingredient_category?: string | null
    ingredient_sub_category?: string | null
    ingredient_price?: Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsUncheckedCreateInput = {
    ingredient_id?: number
    ingredient_name: string
    ingredient_total?: Decimal | DecimalJsLike | number | string | null
    ingredient_unit: string
    ingredient_lastupdate?: Date | string | null
    ingredient_image?: string | null
    ingredient_total_alert?: Decimal | DecimalJsLike | number | string | null
    ingredient_category?: string | null
    ingredient_sub_category?: string | null
    ingredient_price?: Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsUpdateInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ingredient_image?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_total_alert?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_sub_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsUncheckedUpdateInput = {
    ingredient_id?: IntFieldUpdateOperationsInput | number
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ingredient_image?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_total_alert?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_sub_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsCreateManyInput = {
    ingredient_id?: number
    ingredient_name: string
    ingredient_total?: Decimal | DecimalJsLike | number | string | null
    ingredient_unit: string
    ingredient_lastupdate?: Date | string | null
    ingredient_image?: string | null
    ingredient_total_alert?: Decimal | DecimalJsLike | number | string | null
    ingredient_category?: string | null
    ingredient_sub_category?: string | null
    ingredient_price?: Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsUpdateManyMutationInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ingredient_image?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_total_alert?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_sub_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type ingredientsUncheckedUpdateManyInput = {
    ingredient_id?: IntFieldUpdateOperationsInput | number
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_unit?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    ingredient_image?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_total_alert?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_sub_category?: NullableStringFieldUpdateOperationsInput | string | null
    ingredient_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    ingredient_price_per_unit?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
  }

  export type menuCreateInput = {
    menu_name: string
    menu_ingredients: JsonNullValueInput | InputJsonValue
    menu_total?: Decimal | DecimalJsLike | number | string | null
    menu_image?: string | null
    menu_subname?: string | null
    menu_catagory?: string | null
  }

  export type menuUncheckedCreateInput = {
    menu_id?: number
    menu_name: string
    menu_ingredients: JsonNullValueInput | InputJsonValue
    menu_total?: Decimal | DecimalJsLike | number | string | null
    menu_image?: string | null
    menu_subname?: string | null
    menu_catagory?: string | null
  }

  export type menuUpdateInput = {
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: JsonNullValueInput | InputJsonValue
    menu_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    menu_image?: NullableStringFieldUpdateOperationsInput | string | null
    menu_subname?: NullableStringFieldUpdateOperationsInput | string | null
    menu_catagory?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type menuUncheckedUpdateInput = {
    menu_id?: IntFieldUpdateOperationsInput | number
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: JsonNullValueInput | InputJsonValue
    menu_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    menu_image?: NullableStringFieldUpdateOperationsInput | string | null
    menu_subname?: NullableStringFieldUpdateOperationsInput | string | null
    menu_catagory?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type menuCreateManyInput = {
    menu_id?: number
    menu_name: string
    menu_ingredients: JsonNullValueInput | InputJsonValue
    menu_total?: Decimal | DecimalJsLike | number | string | null
    menu_image?: string | null
    menu_subname?: string | null
    menu_catagory?: string | null
  }

  export type menuUpdateManyMutationInput = {
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: JsonNullValueInput | InputJsonValue
    menu_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    menu_image?: NullableStringFieldUpdateOperationsInput | string | null
    menu_subname?: NullableStringFieldUpdateOperationsInput | string | null
    menu_catagory?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type menuUncheckedUpdateManyInput = {
    menu_id?: IntFieldUpdateOperationsInput | number
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: JsonNullValueInput | InputJsonValue
    menu_total?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    menu_image?: NullableStringFieldUpdateOperationsInput | string | null
    menu_subname?: NullableStringFieldUpdateOperationsInput | string | null
    menu_catagory?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
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
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type cartCountOrderByAggregateInput = {
    cart_id?: SortOrder
    cart_username?: SortOrder
    cart_menu_items?: SortOrder
    cart_create_date?: SortOrder
    cart_status?: SortOrder
    cart_order_number?: SortOrder
    cart_last_update?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_location_send?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_receive_time?: SortOrder
  }

  export type cartMaxOrderByAggregateInput = {
    cart_id?: SortOrder
    cart_username?: SortOrder
    cart_create_date?: SortOrder
    cart_status?: SortOrder
    cart_order_number?: SortOrder
    cart_last_update?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_location_send?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_receive_time?: SortOrder
  }

  export type cartMinOrderByAggregateInput = {
    cart_id?: SortOrder
    cart_username?: SortOrder
    cart_create_date?: SortOrder
    cart_status?: SortOrder
    cart_order_number?: SortOrder
    cart_last_update?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_location_send?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_receive_time?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type employeeCountOrderByAggregateInput = {
    employee_id?: SortOrder
    employee_username?: SortOrder
    employee_firstname?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
  }

  export type employeeAvgOrderByAggregateInput = {
    employee_pin?: SortOrder
  }

  export type employeeMaxOrderByAggregateInput = {
    employee_id?: SortOrder
    employee_username?: SortOrder
    employee_firstname?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
  }

  export type employeeMinOrderByAggregateInput = {
    employee_id?: SortOrder
    employee_username?: SortOrder
    employee_firstname?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
  }

  export type employeeSumOrderByAggregateInput = {
    employee_pin?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
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

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type ingredient_transactionsCountOrderByAggregateInput = {
    transaction_id?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_type?: SortOrder
    ingredient_name?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionsAvgOrderByAggregateInput = {
    transaction_id?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
  }

  export type ingredient_transactionsMaxOrderByAggregateInput = {
    transaction_id?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_type?: SortOrder
    ingredient_name?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionsMinOrderByAggregateInput = {
    transaction_id?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_type?: SortOrder
    ingredient_name?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionsSumOrderByAggregateInput = {
    transaction_id?: SortOrder
    transaction_total_price?: SortOrder
    transaction_quantity?: SortOrder
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

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type ingredientsCountOrderByAggregateInput = {
    ingredient_id?: SortOrder
    ingredient_name?: SortOrder
    ingredient_total?: SortOrder
    ingredient_unit?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_image?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_category?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
  }

  export type ingredientsAvgOrderByAggregateInput = {
    ingredient_id?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
  }

  export type ingredientsMaxOrderByAggregateInput = {
    ingredient_id?: SortOrder
    ingredient_name?: SortOrder
    ingredient_total?: SortOrder
    ingredient_unit?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_image?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_category?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
  }

  export type ingredientsMinOrderByAggregateInput = {
    ingredient_id?: SortOrder
    ingredient_name?: SortOrder
    ingredient_total?: SortOrder
    ingredient_unit?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_image?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_category?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
  }

  export type ingredientsSumOrderByAggregateInput = {
    ingredient_id?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
  }

  export type menuCountOrderByAggregateInput = {
    menu_id?: SortOrder
    menu_name?: SortOrder
    menu_ingredients?: SortOrder
    menu_total?: SortOrder
    menu_image?: SortOrder
    menu_subname?: SortOrder
    menu_catagory?: SortOrder
  }

  export type menuAvgOrderByAggregateInput = {
    menu_id?: SortOrder
    menu_total?: SortOrder
  }

  export type menuMaxOrderByAggregateInput = {
    menu_id?: SortOrder
    menu_name?: SortOrder
    menu_total?: SortOrder
    menu_image?: SortOrder
    menu_subname?: SortOrder
    menu_catagory?: SortOrder
  }

  export type menuMinOrderByAggregateInput = {
    menu_id?: SortOrder
    menu_name?: SortOrder
    menu_total?: SortOrder
    menu_image?: SortOrder
    menu_subname?: SortOrder
    menu_catagory?: SortOrder
  }

  export type menuSumOrderByAggregateInput = {
    menu_id?: SortOrder
    menu_total?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
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

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
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

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
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

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
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

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
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