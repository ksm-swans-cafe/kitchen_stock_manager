
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
 * Model CartCartLunchbox
 * 
 */
export type CartCartLunchbox = $Result.DefaultSelection<Prisma.$CartCartLunchboxPayload>
/**
 * Model CartCartLunchboxLunchboxMenu
 * 
 */
export type CartCartLunchboxLunchboxMenu = $Result.DefaultSelection<Prisma.$CartCartLunchboxLunchboxMenuPayload>
/**
 * Model CartCartLunchboxLunchboxMenuMenuIngredients
 * 
 */
export type CartCartLunchboxLunchboxMenuMenuIngredients = $Result.DefaultSelection<Prisma.$CartCartLunchboxLunchboxMenuMenuIngredientsPayload>
/**
 * Model CartCartMenuItems
 * 
 */
export type CartCartMenuItems = $Result.DefaultSelection<Prisma.$CartCartMenuItemsPayload>
/**
 * Model CartCartMenuItemsMenuIngredients
 * 
 */
export type CartCartMenuItemsMenuIngredients = $Result.DefaultSelection<Prisma.$CartCartMenuItemsMenuIngredientsPayload>
/**
 * Model CartCartMenuItemsMenuNotes
 * 
 */
export type CartCartMenuItemsMenuNotes = $Result.DefaultSelection<Prisma.$CartCartMenuItemsMenuNotesPayload>
/**
 * Model MenuMenuIngredients
 * 
 */
export type MenuMenuIngredients = $Result.DefaultSelection<Prisma.$MenuMenuIngredientsPayload>
/**
 * Model MenuMenuLunchbox
 * 
 */
export type MenuMenuLunchbox = $Result.DefaultSelection<Prisma.$MenuMenuLunchboxPayload>
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
 * Model ingredient_transaction
 * 
 */
export type ingredient_transaction = $Result.DefaultSelection<Prisma.$ingredient_transactionPayload>
/**
 * Model ingredients
 * 
 */
export type ingredients = $Result.DefaultSelection<Prisma.$ingredientsPayload>
/**
 * Model lunchbox
 * 
 */
export type lunchbox = $Result.DefaultSelection<Prisma.$lunchboxPayload>
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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

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
   * `prisma.ingredient_transaction`: Exposes CRUD operations for the **ingredient_transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ingredient_transactions
    * const ingredient_transactions = await prisma.ingredient_transaction.findMany()
    * ```
    */
  get ingredient_transaction(): Prisma.ingredient_transactionDelegate<ExtArgs, ClientOptions>;

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
   * `prisma.lunchbox`: Exposes CRUD operations for the **lunchbox** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Lunchboxes
    * const lunchboxes = await prisma.lunchbox.findMany()
    * ```
    */
  get lunchbox(): Prisma.lunchboxDelegate<ExtArgs, ClientOptions>;

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
   * Prisma Client JS version: 6.16.3
   * Query Engine version: bb420e667c1820a8c05a38023385f6cc7ef8e83a
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
    ingredient_transaction: 'ingredient_transaction',
    ingredients: 'ingredients',
    lunchbox: 'lunchbox',
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
      modelProps: "cart" | "employee" | "ingredient_transaction" | "ingredients" | "lunchbox" | "menu"
      txIsolationLevel: never
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
          findRaw: {
            args: Prisma.cartFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.cartAggregateRawArgs<ExtArgs>
            result: JsonObject
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
          findRaw: {
            args: Prisma.employeeFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.employeeAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.employeeCountArgs<ExtArgs>
            result: $Utils.Optional<EmployeeCountAggregateOutputType> | number
          }
        }
      }
      ingredient_transaction: {
        payload: Prisma.$ingredient_transactionPayload<ExtArgs>
        fields: Prisma.ingredient_transactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ingredient_transactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ingredient_transactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>
          }
          findFirst: {
            args: Prisma.ingredient_transactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ingredient_transactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>
          }
          findMany: {
            args: Prisma.ingredient_transactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>[]
          }
          create: {
            args: Prisma.ingredient_transactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>
          }
          createMany: {
            args: Prisma.ingredient_transactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ingredient_transactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>
          }
          update: {
            args: Prisma.ingredient_transactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>
          }
          deleteMany: {
            args: Prisma.ingredient_transactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ingredient_transactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ingredient_transactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ingredient_transactionPayload>
          }
          aggregate: {
            args: Prisma.Ingredient_transactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngredient_transaction>
          }
          groupBy: {
            args: Prisma.ingredient_transactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ingredient_transactionGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.ingredient_transactionFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ingredient_transactionAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ingredient_transactionCountArgs<ExtArgs>
            result: $Utils.Optional<Ingredient_transactionCountAggregateOutputType> | number
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
          findRaw: {
            args: Prisma.ingredientsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.ingredientsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.ingredientsCountArgs<ExtArgs>
            result: $Utils.Optional<IngredientsCountAggregateOutputType> | number
          }
        }
      }
      lunchbox: {
        payload: Prisma.$lunchboxPayload<ExtArgs>
        fields: Prisma.lunchboxFieldRefs
        operations: {
          findUnique: {
            args: Prisma.lunchboxFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.lunchboxFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>
          }
          findFirst: {
            args: Prisma.lunchboxFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.lunchboxFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>
          }
          findMany: {
            args: Prisma.lunchboxFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>[]
          }
          create: {
            args: Prisma.lunchboxCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>
          }
          createMany: {
            args: Prisma.lunchboxCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.lunchboxDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>
          }
          update: {
            args: Prisma.lunchboxUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>
          }
          deleteMany: {
            args: Prisma.lunchboxDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.lunchboxUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.lunchboxUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$lunchboxPayload>
          }
          aggregate: {
            args: Prisma.LunchboxAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLunchbox>
          }
          groupBy: {
            args: Prisma.lunchboxGroupByArgs<ExtArgs>
            result: $Utils.Optional<LunchboxGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.lunchboxFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.lunchboxAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.lunchboxCountArgs<ExtArgs>
            result: $Utils.Optional<LunchboxCountAggregateOutputType> | number
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
          findRaw: {
            args: Prisma.menuFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.menuAggregateRawArgs<ExtArgs>
            result: JsonObject
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
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
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
    ingredient_transaction?: ingredient_transactionOmit
    ingredients?: ingredientsOmit
    lunchbox?: lunchboxOmit
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
   * Model CartCartLunchbox
   */





  export type CartCartLunchboxSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    lunchbox_limit?: boolean
    lunchbox_menu?: boolean | CartCartLunchboxLunchboxMenuDefaultArgs<ExtArgs>
    lunchbox_name?: boolean
    lunchbox_set_name?: boolean
    lunchbox_total?: boolean
    lunchbox_total_cost?: boolean
  }, ExtArgs["result"]["cartCartLunchbox"]>



  export type CartCartLunchboxSelectScalar = {
    lunchbox_limit?: boolean
    lunchbox_name?: boolean
    lunchbox_set_name?: boolean
    lunchbox_total?: boolean
    lunchbox_total_cost?: boolean
  }

  export type CartCartLunchboxOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"lunchbox_limit" | "lunchbox_menu" | "lunchbox_name" | "lunchbox_set_name" | "lunchbox_total" | "lunchbox_total_cost", ExtArgs["result"]["cartCartLunchbox"]>
  export type CartCartLunchboxInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CartCartLunchboxPayload = {
    name: "CartCartLunchbox"
    objects: {}
    scalars: {
      /**
       * Multiple data types found: Int: 75%, BigInt: 25% out of 4 sampled entries
       */
      lunchbox_limit: Prisma.JsonValue
      lunchbox_name: string
      lunchbox_set_name: string
      /**
       * Multiple data types found: Int: 75%, BigInt: 25% out of 4 sampled entries
       */
      lunchbox_total: Prisma.JsonValue
      lunchbox_total_cost: number
    }
    composites: {
      lunchbox_menu: Prisma.$CartCartLunchboxLunchboxMenuPayload[]
    }
  }

  type CartCartLunchboxGetPayload<S extends boolean | null | undefined | CartCartLunchboxDefaultArgs> = $Result.GetResult<Prisma.$CartCartLunchboxPayload, S>





  /**
   * Fields of the CartCartLunchbox model
   */
  interface CartCartLunchboxFieldRefs {
    readonly lunchbox_limit: FieldRef<"CartCartLunchbox", 'Json'>
    readonly lunchbox_name: FieldRef<"CartCartLunchbox", 'String'>
    readonly lunchbox_set_name: FieldRef<"CartCartLunchbox", 'String'>
    readonly lunchbox_total: FieldRef<"CartCartLunchbox", 'Json'>
    readonly lunchbox_total_cost: FieldRef<"CartCartLunchbox", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CartCartLunchbox without action
   */
  export type CartCartLunchboxDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CartCartLunchbox
     */
    select?: CartCartLunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CartCartLunchbox
     */
    omit?: CartCartLunchboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CartCartLunchboxInclude<ExtArgs> | null
  }


  /**
   * Model CartCartLunchboxLunchboxMenu
   */





  export type CartCartLunchboxLunchboxMenuSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    menu_category?: boolean
    menu_cost?: boolean
    menu_description?: boolean
    menu_ingredients?: boolean | CartCartLunchboxLunchboxMenuMenuIngredientsDefaultArgs<ExtArgs>
    menu_name?: boolean
    menu_order_id?: boolean
    menu_subname?: boolean
    menu_total?: boolean
  }, ExtArgs["result"]["cartCartLunchboxLunchboxMenu"]>



  export type CartCartLunchboxLunchboxMenuSelectScalar = {
    menu_category?: boolean
    menu_cost?: boolean
    menu_description?: boolean
    menu_name?: boolean
    menu_order_id?: boolean
    menu_subname?: boolean
    menu_total?: boolean
  }

  export type CartCartLunchboxLunchboxMenuOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"menu_category" | "menu_cost" | "menu_description" | "menu_ingredients" | "menu_name" | "menu_order_id" | "menu_subname" | "menu_total", ExtArgs["result"]["cartCartLunchboxLunchboxMenu"]>
  export type CartCartLunchboxLunchboxMenuInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CartCartLunchboxLunchboxMenuPayload = {
    name: "CartCartLunchboxLunchboxMenu"
    objects: {}
    scalars: {
      menu_category: string
      menu_cost: bigint | null
      menu_description: string
      menu_name: string
      /**
       * Multiple data types found: Int: 75%, BigInt: 25% out of 8 sampled entries
       */
      menu_order_id: Prisma.JsonValue
      menu_subname: string
      /**
       * Multiple data types found: Int: 75%, BigInt: 25% out of 8 sampled entries
       */
      menu_total: Prisma.JsonValue
    }
    composites: {
      menu_ingredients: Prisma.$CartCartLunchboxLunchboxMenuMenuIngredientsPayload[]
    }
  }

  type CartCartLunchboxLunchboxMenuGetPayload<S extends boolean | null | undefined | CartCartLunchboxLunchboxMenuDefaultArgs> = $Result.GetResult<Prisma.$CartCartLunchboxLunchboxMenuPayload, S>





  /**
   * Fields of the CartCartLunchboxLunchboxMenu model
   */
  interface CartCartLunchboxLunchboxMenuFieldRefs {
    readonly menu_category: FieldRef<"CartCartLunchboxLunchboxMenu", 'String'>
    readonly menu_cost: FieldRef<"CartCartLunchboxLunchboxMenu", 'BigInt'>
    readonly menu_description: FieldRef<"CartCartLunchboxLunchboxMenu", 'String'>
    readonly menu_name: FieldRef<"CartCartLunchboxLunchboxMenu", 'String'>
    readonly menu_order_id: FieldRef<"CartCartLunchboxLunchboxMenu", 'Json'>
    readonly menu_subname: FieldRef<"CartCartLunchboxLunchboxMenu", 'String'>
    readonly menu_total: FieldRef<"CartCartLunchboxLunchboxMenu", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * CartCartLunchboxLunchboxMenu without action
   */
  export type CartCartLunchboxLunchboxMenuDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CartCartLunchboxLunchboxMenu
     */
    select?: CartCartLunchboxLunchboxMenuSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CartCartLunchboxLunchboxMenu
     */
    omit?: CartCartLunchboxLunchboxMenuOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CartCartLunchboxLunchboxMenuInclude<ExtArgs> | null
  }


  /**
   * Model CartCartLunchboxLunchboxMenuMenuIngredients
   */





  export type CartCartLunchboxLunchboxMenuMenuIngredientsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ingredient_name?: boolean
    useItem?: boolean
  }, ExtArgs["result"]["cartCartLunchboxLunchboxMenuMenuIngredients"]>



  export type CartCartLunchboxLunchboxMenuMenuIngredientsSelectScalar = {
    ingredient_name?: boolean
    useItem?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ingredient_name" | "useItem", ExtArgs["result"]["cartCartLunchboxLunchboxMenuMenuIngredients"]>

  export type $CartCartLunchboxLunchboxMenuMenuIngredientsPayload = {
    name: "CartCartLunchboxLunchboxMenuMenuIngredients"
    objects: {}
    scalars: {
      ingredient_name: string
      /**
       * Multiple data types found: Int: 75.9%, BigInt: 24.1% out of 29 sampled entries
       */
      useItem: Prisma.JsonValue
    }
    composites: {}
  }

  type CartCartLunchboxLunchboxMenuMenuIngredientsGetPayload<S extends boolean | null | undefined | CartCartLunchboxLunchboxMenuMenuIngredientsDefaultArgs> = $Result.GetResult<Prisma.$CartCartLunchboxLunchboxMenuMenuIngredientsPayload, S>





  /**
   * Fields of the CartCartLunchboxLunchboxMenuMenuIngredients model
   */
  interface CartCartLunchboxLunchboxMenuMenuIngredientsFieldRefs {
    readonly ingredient_name: FieldRef<"CartCartLunchboxLunchboxMenuMenuIngredients", 'String'>
    readonly useItem: FieldRef<"CartCartLunchboxLunchboxMenuMenuIngredients", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * CartCartLunchboxLunchboxMenuMenuIngredients without action
   */
  export type CartCartLunchboxLunchboxMenuMenuIngredientsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CartCartLunchboxLunchboxMenuMenuIngredients
     */
    select?: CartCartLunchboxLunchboxMenuMenuIngredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CartCartLunchboxLunchboxMenuMenuIngredients
     */
    omit?: CartCartLunchboxLunchboxMenuMenuIngredientsOmit<ExtArgs> | null
  }


  /**
   * Model CartCartMenuItems
   */





  export type CartCartMenuItemsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    menu_description?: boolean
    menu_ingredients?: boolean | CartCartMenuItemsMenuIngredientsDefaultArgs<ExtArgs>
    menu_name?: boolean
    menu_notes?: boolean | CartCartMenuItemsMenuNotesDefaultArgs<ExtArgs>
    menu_order_id?: boolean
    menu_total?: boolean
  }, ExtArgs["result"]["cartCartMenuItems"]>



  export type CartCartMenuItemsSelectScalar = {
    menu_description?: boolean
    menu_name?: boolean
    menu_order_id?: boolean
    menu_total?: boolean
  }

  export type CartCartMenuItemsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"menu_description" | "menu_ingredients" | "menu_name" | "menu_notes" | "menu_order_id" | "menu_total", ExtArgs["result"]["cartCartMenuItems"]>
  export type CartCartMenuItemsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CartCartMenuItemsPayload = {
    name: "CartCartMenuItems"
    objects: {}
    scalars: {
      menu_description: string | null
      menu_name: string
      menu_order_id: number | null
      menu_total: number
    }
    composites: {
      menu_ingredients: Prisma.$CartCartMenuItemsMenuIngredientsPayload[]
      menu_notes: Prisma.$CartCartMenuItemsMenuNotesPayload[]
    }
  }

  type CartCartMenuItemsGetPayload<S extends boolean | null | undefined | CartCartMenuItemsDefaultArgs> = $Result.GetResult<Prisma.$CartCartMenuItemsPayload, S>





  /**
   * Fields of the CartCartMenuItems model
   */
  interface CartCartMenuItemsFieldRefs {
    readonly menu_description: FieldRef<"CartCartMenuItems", 'String'>
    readonly menu_name: FieldRef<"CartCartMenuItems", 'String'>
    readonly menu_order_id: FieldRef<"CartCartMenuItems", 'Int'>
    readonly menu_total: FieldRef<"CartCartMenuItems", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CartCartMenuItems without action
   */
  export type CartCartMenuItemsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CartCartMenuItems
     */
    select?: CartCartMenuItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CartCartMenuItems
     */
    omit?: CartCartMenuItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CartCartMenuItemsInclude<ExtArgs> | null
  }


  /**
   * Model CartCartMenuItemsMenuIngredients
   */





  export type CartCartMenuItemsMenuIngredientsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ingredient_name?: boolean
    ingredient_status?: boolean
    useItem?: boolean
  }, ExtArgs["result"]["cartCartMenuItemsMenuIngredients"]>



  export type CartCartMenuItemsMenuIngredientsSelectScalar = {
    ingredient_name?: boolean
    ingredient_status?: boolean
    useItem?: boolean
  }

  export type CartCartMenuItemsMenuIngredientsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ingredient_name" | "ingredient_status" | "useItem", ExtArgs["result"]["cartCartMenuItemsMenuIngredients"]>

  export type $CartCartMenuItemsMenuIngredientsPayload = {
    name: "CartCartMenuItemsMenuIngredients"
    objects: {}
    scalars: {
      ingredient_name: string
      ingredient_status: boolean | null
      useItem: number
    }
    composites: {}
  }

  type CartCartMenuItemsMenuIngredientsGetPayload<S extends boolean | null | undefined | CartCartMenuItemsMenuIngredientsDefaultArgs> = $Result.GetResult<Prisma.$CartCartMenuItemsMenuIngredientsPayload, S>





  /**
   * Fields of the CartCartMenuItemsMenuIngredients model
   */
  interface CartCartMenuItemsMenuIngredientsFieldRefs {
    readonly ingredient_name: FieldRef<"CartCartMenuItemsMenuIngredients", 'String'>
    readonly ingredient_status: FieldRef<"CartCartMenuItemsMenuIngredients", 'Boolean'>
    readonly useItem: FieldRef<"CartCartMenuItemsMenuIngredients", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CartCartMenuItemsMenuIngredients without action
   */
  export type CartCartMenuItemsMenuIngredientsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CartCartMenuItemsMenuIngredients
     */
    select?: CartCartMenuItemsMenuIngredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CartCartMenuItemsMenuIngredients
     */
    omit?: CartCartMenuItemsMenuIngredientsOmit<ExtArgs> | null
  }


  /**
   * Model CartCartMenuItemsMenuNotes
   */





  export type CartCartMenuItemsMenuNotesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    note?: boolean
    qty?: boolean
  }, ExtArgs["result"]["cartCartMenuItemsMenuNotes"]>



  export type CartCartMenuItemsMenuNotesSelectScalar = {
    note?: boolean
    qty?: boolean
  }

  export type CartCartMenuItemsMenuNotesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"note" | "qty", ExtArgs["result"]["cartCartMenuItemsMenuNotes"]>

  export type $CartCartMenuItemsMenuNotesPayload = {
    name: "CartCartMenuItemsMenuNotes"
    objects: {}
    scalars: {
      note: string
      qty: number
    }
    composites: {}
  }

  type CartCartMenuItemsMenuNotesGetPayload<S extends boolean | null | undefined | CartCartMenuItemsMenuNotesDefaultArgs> = $Result.GetResult<Prisma.$CartCartMenuItemsMenuNotesPayload, S>





  /**
   * Fields of the CartCartMenuItemsMenuNotes model
   */
  interface CartCartMenuItemsMenuNotesFieldRefs {
    readonly note: FieldRef<"CartCartMenuItemsMenuNotes", 'String'>
    readonly qty: FieldRef<"CartCartMenuItemsMenuNotes", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * CartCartMenuItemsMenuNotes without action
   */
  export type CartCartMenuItemsMenuNotesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CartCartMenuItemsMenuNotes
     */
    select?: CartCartMenuItemsMenuNotesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CartCartMenuItemsMenuNotes
     */
    omit?: CartCartMenuItemsMenuNotesOmit<ExtArgs> | null
  }


  /**
   * Model MenuMenuIngredients
   */





  export type MenuMenuIngredientsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ingredient_name?: boolean
    useItem?: boolean
  }, ExtArgs["result"]["menuMenuIngredients"]>



  export type MenuMenuIngredientsSelectScalar = {
    ingredient_name?: boolean
    useItem?: boolean
  }

  export type MenuMenuIngredientsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"ingredient_name" | "useItem", ExtArgs["result"]["menuMenuIngredients"]>

  export type $MenuMenuIngredientsPayload = {
    name: "MenuMenuIngredients"
    objects: {}
    scalars: {
      ingredient_name: string
      /**
       * Multiple data types found: Int: 98.5%, BigInt: 1.5% out of 337 sampled entries
       */
      useItem: Prisma.JsonValue
    }
    composites: {}
  }

  type MenuMenuIngredientsGetPayload<S extends boolean | null | undefined | MenuMenuIngredientsDefaultArgs> = $Result.GetResult<Prisma.$MenuMenuIngredientsPayload, S>





  /**
   * Fields of the MenuMenuIngredients model
   */
  interface MenuMenuIngredientsFieldRefs {
    readonly ingredient_name: FieldRef<"MenuMenuIngredients", 'String'>
    readonly useItem: FieldRef<"MenuMenuIngredients", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * MenuMenuIngredients without action
   */
  export type MenuMenuIngredientsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MenuMenuIngredients
     */
    select?: MenuMenuIngredientsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MenuMenuIngredients
     */
    omit?: MenuMenuIngredientsOmit<ExtArgs> | null
  }


  /**
   * Model MenuMenuLunchbox
   */





  export type MenuMenuLunchboxSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    lunchbox_name?: boolean
    lunchbox_set_name?: boolean
  }, ExtArgs["result"]["menuMenuLunchbox"]>



  export type MenuMenuLunchboxSelectScalar = {
    lunchbox_name?: boolean
    lunchbox_set_name?: boolean
  }

  export type MenuMenuLunchboxOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"lunchbox_name" | "lunchbox_set_name", ExtArgs["result"]["menuMenuLunchbox"]>

  export type $MenuMenuLunchboxPayload = {
    name: "MenuMenuLunchbox"
    objects: {}
    scalars: {
      lunchbox_name: string
      lunchbox_set_name: string
    }
    composites: {}
  }

  type MenuMenuLunchboxGetPayload<S extends boolean | null | undefined | MenuMenuLunchboxDefaultArgs> = $Result.GetResult<Prisma.$MenuMenuLunchboxPayload, S>





  /**
   * Fields of the MenuMenuLunchbox model
   */
  interface MenuMenuLunchboxFieldRefs {
    readonly lunchbox_name: FieldRef<"MenuMenuLunchbox", 'String'>
    readonly lunchbox_set_name: FieldRef<"MenuMenuLunchbox", 'String'>
  }
    

  // Custom InputTypes
  /**
   * MenuMenuLunchbox without action
   */
  export type MenuMenuLunchboxDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MenuMenuLunchbox
     */
    select?: MenuMenuLunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MenuMenuLunchbox
     */
    omit?: MenuMenuLunchboxOmit<ExtArgs> | null
  }


  /**
   * Model cart
   */

  export type AggregateCart = {
    _count: CartCountAggregateOutputType | null
    _min: CartMinAggregateOutputType | null
    _max: CartMaxAggregateOutputType | null
  }

  export type CartMinAggregateOutputType = {
    id: string | null
    cart_create_date: string | null
    cart_customer_name: string | null
    cart_customer_tel: string | null
    cart_delivery_date: string | null
    cart_export_time: string | null
    cart_id: string | null
    cart_last_update: string | null
    cart_location_send: string | null
    cart_order_number: string | null
    cart_receive_time: string | null
    cart_shipping_cost: string | null
    cart_status: string | null
    cart_username: string | null
  }

  export type CartMaxAggregateOutputType = {
    id: string | null
    cart_create_date: string | null
    cart_customer_name: string | null
    cart_customer_tel: string | null
    cart_delivery_date: string | null
    cart_export_time: string | null
    cart_id: string | null
    cart_last_update: string | null
    cart_location_send: string | null
    cart_order_number: string | null
    cart_receive_time: string | null
    cart_shipping_cost: string | null
    cart_status: string | null
    cart_username: string | null
  }

  export type CartCountAggregateOutputType = {
    id: number
    cart_create_date: number
    cart_customer_name: number
    cart_customer_tel: number
    cart_delivery_date: number
    cart_export_time: number
    cart_id: number
    cart_last_update: number
    cart_location_send: number
    cart_order_number: number
    cart_receive_time: number
    cart_shipping_cost: number
    cart_status: number
    cart_username: number
    _all: number
  }


  export type CartMinAggregateInputType = {
    id?: true
    cart_create_date?: true
    cart_customer_name?: true
    cart_customer_tel?: true
    cart_delivery_date?: true
    cart_export_time?: true
    cart_id?: true
    cart_last_update?: true
    cart_location_send?: true
    cart_order_number?: true
    cart_receive_time?: true
    cart_shipping_cost?: true
    cart_status?: true
    cart_username?: true
  }

  export type CartMaxAggregateInputType = {
    id?: true
    cart_create_date?: true
    cart_customer_name?: true
    cart_customer_tel?: true
    cart_delivery_date?: true
    cart_export_time?: true
    cart_id?: true
    cart_last_update?: true
    cart_location_send?: true
    cart_order_number?: true
    cart_receive_time?: true
    cart_shipping_cost?: true
    cart_status?: true
    cart_username?: true
  }

  export type CartCountAggregateInputType = {
    id?: true
    cart_create_date?: true
    cart_customer_name?: true
    cart_customer_tel?: true
    cart_delivery_date?: true
    cart_export_time?: true
    cart_id?: true
    cart_last_update?: true
    cart_location_send?: true
    cart_order_number?: true
    cart_receive_time?: true
    cart_shipping_cost?: true
    cart_status?: true
    cart_username?: true
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
    id: string
    cart_create_date: string
    cart_customer_name: string
    cart_customer_tel: string
    cart_delivery_date: string
    cart_export_time: string
    cart_id: string
    cart_last_update: string | null
    cart_location_send: string
    cart_order_number: string
    cart_receive_time: string
    cart_shipping_cost: string
    cart_status: string
    cart_username: string
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
    id?: boolean
    cart_create_date?: boolean
    cart_customer_name?: boolean
    cart_customer_tel?: boolean
    cart_delivery_date?: boolean
    cart_export_time?: boolean
    cart_id?: boolean
    cart_last_update?: boolean
    cart_location_send?: boolean
    cart_lunchbox?: boolean | CartCartLunchboxDefaultArgs<ExtArgs>
    cart_menu_items?: boolean | CartCartMenuItemsDefaultArgs<ExtArgs>
    cart_order_number?: boolean
    cart_receive_time?: boolean
    cart_shipping_cost?: boolean
    cart_status?: boolean
    cart_username?: boolean
  }, ExtArgs["result"]["cart"]>



  export type cartSelectScalar = {
    id?: boolean
    cart_create_date?: boolean
    cart_customer_name?: boolean
    cart_customer_tel?: boolean
    cart_delivery_date?: boolean
    cart_export_time?: boolean
    cart_id?: boolean
    cart_last_update?: boolean
    cart_location_send?: boolean
    cart_order_number?: boolean
    cart_receive_time?: boolean
    cart_shipping_cost?: boolean
    cart_status?: boolean
    cart_username?: boolean
  }

  export type cartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cart_create_date" | "cart_customer_name" | "cart_customer_tel" | "cart_delivery_date" | "cart_export_time" | "cart_id" | "cart_last_update" | "cart_location_send" | "cart_lunchbox" | "cart_menu_items" | "cart_order_number" | "cart_receive_time" | "cart_shipping_cost" | "cart_status" | "cart_username", ExtArgs["result"]["cart"]>
  export type cartInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $cartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "cart"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cart_create_date: string
      cart_customer_name: string
      cart_customer_tel: string
      cart_delivery_date: string
      cart_export_time: string
      cart_id: string
      cart_last_update: string | null
      cart_location_send: string
      cart_order_number: string
      cart_receive_time: string
      cart_shipping_cost: string
      cart_status: string
      cart_username: string
    }, ExtArgs["result"]["cart"]>
    composites: {
      cart_lunchbox: Prisma.$CartCartLunchboxPayload[]
      cart_menu_items: Prisma.$CartCartMenuItemsPayload[]
    }
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
     * // Only select the `id`
     * const cartWithIdOnly = await prisma.cart.findMany({ select: { id: true } })
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
     * Find zero or more Carts that matches the filter.
     * @param {cartFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const cart = await prisma.cart.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: cartFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Cart.
     * @param {cartAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const cart = await prisma.cart.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: cartAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


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
    readonly id: FieldRef<"cart", 'String'>
    readonly cart_create_date: FieldRef<"cart", 'String'>
    readonly cart_customer_name: FieldRef<"cart", 'String'>
    readonly cart_customer_tel: FieldRef<"cart", 'String'>
    readonly cart_delivery_date: FieldRef<"cart", 'String'>
    readonly cart_export_time: FieldRef<"cart", 'String'>
    readonly cart_id: FieldRef<"cart", 'String'>
    readonly cart_last_update: FieldRef<"cart", 'String'>
    readonly cart_location_send: FieldRef<"cart", 'String'>
    readonly cart_order_number: FieldRef<"cart", 'String'>
    readonly cart_receive_time: FieldRef<"cart", 'String'>
    readonly cart_shipping_cost: FieldRef<"cart", 'String'>
    readonly cart_status: FieldRef<"cart", 'String'>
    readonly cart_username: FieldRef<"cart", 'String'>
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
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
   * cart findRaw
   */
  export type cartFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * cart aggregateRaw
   */
  export type cartAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: cartInclude<ExtArgs> | null
  }


  /**
   * Model employee
   */

  export type AggregateEmployee = {
    _count: EmployeeCountAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  export type EmployeeMinAggregateOutputType = {
    id: string | null
    employee_firstname: string | null
    employee_id: string | null
    employee_lastname: string | null
    employee_pin: string | null
    employee_role: string | null
    employee_username: string | null
  }

  export type EmployeeMaxAggregateOutputType = {
    id: string | null
    employee_firstname: string | null
    employee_id: string | null
    employee_lastname: string | null
    employee_pin: string | null
    employee_role: string | null
    employee_username: string | null
  }

  export type EmployeeCountAggregateOutputType = {
    id: number
    employee_firstname: number
    employee_id: number
    employee_lastname: number
    employee_pin: number
    employee_role: number
    employee_username: number
    _all: number
  }


  export type EmployeeMinAggregateInputType = {
    id?: true
    employee_firstname?: true
    employee_id?: true
    employee_lastname?: true
    employee_pin?: true
    employee_role?: true
    employee_username?: true
  }

  export type EmployeeMaxAggregateInputType = {
    id?: true
    employee_firstname?: true
    employee_id?: true
    employee_lastname?: true
    employee_pin?: true
    employee_role?: true
    employee_username?: true
  }

  export type EmployeeCountAggregateInputType = {
    id?: true
    employee_firstname?: true
    employee_id?: true
    employee_lastname?: true
    employee_pin?: true
    employee_role?: true
    employee_username?: true
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
    _min?: EmployeeMinAggregateInputType
    _max?: EmployeeMaxAggregateInputType
  }

  export type EmployeeGroupByOutputType = {
    id: string
    employee_firstname: string
    employee_id: string
    employee_lastname: string
    employee_pin: string
    employee_role: string
    employee_username: string
    _count: EmployeeCountAggregateOutputType | null
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
    id?: boolean
    employee_firstname?: boolean
    employee_id?: boolean
    employee_lastname?: boolean
    employee_pin?: boolean
    employee_role?: boolean
    employee_username?: boolean
  }, ExtArgs["result"]["employee"]>



  export type employeeSelectScalar = {
    id?: boolean
    employee_firstname?: boolean
    employee_id?: boolean
    employee_lastname?: boolean
    employee_pin?: boolean
    employee_role?: boolean
    employee_username?: boolean
  }

  export type employeeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employee_firstname" | "employee_id" | "employee_lastname" | "employee_pin" | "employee_role" | "employee_username", ExtArgs["result"]["employee"]>

  export type $employeePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "employee"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      employee_firstname: string
      employee_id: string
      employee_lastname: string
      employee_pin: string
      employee_role: string
      employee_username: string
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
     * // Only select the `id`
     * const employeeWithIdOnly = await prisma.employee.findMany({ select: { id: true } })
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
     * Find zero or more Employees that matches the filter.
     * @param {employeeFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const employee = await prisma.employee.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: employeeFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Employee.
     * @param {employeeAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const employee = await prisma.employee.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: employeeAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


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
    readonly id: FieldRef<"employee", 'String'>
    readonly employee_firstname: FieldRef<"employee", 'String'>
    readonly employee_id: FieldRef<"employee", 'String'>
    readonly employee_lastname: FieldRef<"employee", 'String'>
    readonly employee_pin: FieldRef<"employee", 'String'>
    readonly employee_role: FieldRef<"employee", 'String'>
    readonly employee_username: FieldRef<"employee", 'String'>
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
    data: XOR<employeeCreateInput, employeeUncheckedCreateInput>
  }

  /**
   * employee createMany
   */
  export type employeeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many employees.
     */
    data: employeeCreateManyInput | employeeCreateManyInput[]
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
   * employee findRaw
   */
  export type employeeFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * employee aggregateRaw
   */
  export type employeeAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
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
   * Model ingredient_transaction
   */

  export type AggregateIngredient_transaction = {
    _count: Ingredient_transactionCountAggregateOutputType | null
    _avg: Ingredient_transactionAvgAggregateOutputType | null
    _sum: Ingredient_transactionSumAggregateOutputType | null
    _min: Ingredient_transactionMinAggregateOutputType | null
    _max: Ingredient_transactionMaxAggregateOutputType | null
  }

  export type Ingredient_transactionAvgAggregateOutputType = {
    transaction_id: number | null
  }

  export type Ingredient_transactionSumAggregateOutputType = {
    transaction_id: number | null
  }

  export type Ingredient_transactionMinAggregateOutputType = {
    id: string | null
    ingredient_name: string | null
    transaction_date: string | null
    transaction_from_username: string | null
    transaction_id: number | null
    transaction_quantity: string | null
    transaction_total_price: string | null
    transaction_type: string | null
    transaction_units: string | null
  }

  export type Ingredient_transactionMaxAggregateOutputType = {
    id: string | null
    ingredient_name: string | null
    transaction_date: string | null
    transaction_from_username: string | null
    transaction_id: number | null
    transaction_quantity: string | null
    transaction_total_price: string | null
    transaction_type: string | null
    transaction_units: string | null
  }

  export type Ingredient_transactionCountAggregateOutputType = {
    id: number
    ingredient_name: number
    transaction_date: number
    transaction_from_username: number
    transaction_id: number
    transaction_quantity: number
    transaction_total_price: number
    transaction_type: number
    transaction_units: number
    _all: number
  }


  export type Ingredient_transactionAvgAggregateInputType = {
    transaction_id?: true
  }

  export type Ingredient_transactionSumAggregateInputType = {
    transaction_id?: true
  }

  export type Ingredient_transactionMinAggregateInputType = {
    id?: true
    ingredient_name?: true
    transaction_date?: true
    transaction_from_username?: true
    transaction_id?: true
    transaction_quantity?: true
    transaction_total_price?: true
    transaction_type?: true
    transaction_units?: true
  }

  export type Ingredient_transactionMaxAggregateInputType = {
    id?: true
    ingredient_name?: true
    transaction_date?: true
    transaction_from_username?: true
    transaction_id?: true
    transaction_quantity?: true
    transaction_total_price?: true
    transaction_type?: true
    transaction_units?: true
  }

  export type Ingredient_transactionCountAggregateInputType = {
    id?: true
    ingredient_name?: true
    transaction_date?: true
    transaction_from_username?: true
    transaction_id?: true
    transaction_quantity?: true
    transaction_total_price?: true
    transaction_type?: true
    transaction_units?: true
    _all?: true
  }

  export type Ingredient_transactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ingredient_transaction to aggregate.
     */
    where?: ingredient_transactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionOrderByWithRelationInput | ingredient_transactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ingredient_transactionWhereUniqueInput
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
    _count?: true | Ingredient_transactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ingredient_transactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ingredient_transactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ingredient_transactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ingredient_transactionMaxAggregateInputType
  }

  export type GetIngredient_transactionAggregateType<T extends Ingredient_transactionAggregateArgs> = {
        [P in keyof T & keyof AggregateIngredient_transaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngredient_transaction[P]>
      : GetScalarType<T[P], AggregateIngredient_transaction[P]>
  }




  export type ingredient_transactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ingredient_transactionWhereInput
    orderBy?: ingredient_transactionOrderByWithAggregationInput | ingredient_transactionOrderByWithAggregationInput[]
    by: Ingredient_transactionScalarFieldEnum[] | Ingredient_transactionScalarFieldEnum
    having?: ingredient_transactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ingredient_transactionCountAggregateInputType | true
    _avg?: Ingredient_transactionAvgAggregateInputType
    _sum?: Ingredient_transactionSumAggregateInputType
    _min?: Ingredient_transactionMinAggregateInputType
    _max?: Ingredient_transactionMaxAggregateInputType
  }

  export type Ingredient_transactionGroupByOutputType = {
    id: string
    ingredient_name: string
    transaction_date: string
    transaction_from_username: string
    transaction_id: number
    transaction_quantity: string
    transaction_total_price: string
    transaction_type: string
    transaction_units: string
    _count: Ingredient_transactionCountAggregateOutputType | null
    _avg: Ingredient_transactionAvgAggregateOutputType | null
    _sum: Ingredient_transactionSumAggregateOutputType | null
    _min: Ingredient_transactionMinAggregateOutputType | null
    _max: Ingredient_transactionMaxAggregateOutputType | null
  }

  type GetIngredient_transactionGroupByPayload<T extends ingredient_transactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ingredient_transactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ingredient_transactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ingredient_transactionGroupByOutputType[P]>
            : GetScalarType<T[P], Ingredient_transactionGroupByOutputType[P]>
        }
      >
    >


  export type ingredient_transactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ingredient_name?: boolean
    transaction_date?: boolean
    transaction_from_username?: boolean
    transaction_id?: boolean
    transaction_quantity?: boolean
    transaction_total_price?: boolean
    transaction_type?: boolean
    transaction_units?: boolean
  }, ExtArgs["result"]["ingredient_transaction"]>



  export type ingredient_transactionSelectScalar = {
    id?: boolean
    ingredient_name?: boolean
    transaction_date?: boolean
    transaction_from_username?: boolean
    transaction_id?: boolean
    transaction_quantity?: boolean
    transaction_total_price?: boolean
    transaction_type?: boolean
    transaction_units?: boolean
  }

  export type ingredient_transactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ingredient_name" | "transaction_date" | "transaction_from_username" | "transaction_id" | "transaction_quantity" | "transaction_total_price" | "transaction_type" | "transaction_units", ExtArgs["result"]["ingredient_transaction"]>

  export type $ingredient_transactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ingredient_transaction"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ingredient_name: string
      transaction_date: string
      transaction_from_username: string
      transaction_id: number
      transaction_quantity: string
      transaction_total_price: string
      transaction_type: string
      transaction_units: string
    }, ExtArgs["result"]["ingredient_transaction"]>
    composites: {}
  }

  type ingredient_transactionGetPayload<S extends boolean | null | undefined | ingredient_transactionDefaultArgs> = $Result.GetResult<Prisma.$ingredient_transactionPayload, S>

  type ingredient_transactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ingredient_transactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ingredient_transactionCountAggregateInputType | true
    }

  export interface ingredient_transactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ingredient_transaction'], meta: { name: 'ingredient_transaction' } }
    /**
     * Find zero or one Ingredient_transaction that matches the filter.
     * @param {ingredient_transactionFindUniqueArgs} args - Arguments to find a Ingredient_transaction
     * @example
     * // Get one Ingredient_transaction
     * const ingredient_transaction = await prisma.ingredient_transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ingredient_transactionFindUniqueArgs>(args: SelectSubset<T, ingredient_transactionFindUniqueArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ingredient_transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ingredient_transactionFindUniqueOrThrowArgs} args - Arguments to find a Ingredient_transaction
     * @example
     * // Get one Ingredient_transaction
     * const ingredient_transaction = await prisma.ingredient_transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ingredient_transactionFindUniqueOrThrowArgs>(args: SelectSubset<T, ingredient_transactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredient_transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionFindFirstArgs} args - Arguments to find a Ingredient_transaction
     * @example
     * // Get one Ingredient_transaction
     * const ingredient_transaction = await prisma.ingredient_transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ingredient_transactionFindFirstArgs>(args?: SelectSubset<T, ingredient_transactionFindFirstArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredient_transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionFindFirstOrThrowArgs} args - Arguments to find a Ingredient_transaction
     * @example
     * // Get one Ingredient_transaction
     * const ingredient_transaction = await prisma.ingredient_transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ingredient_transactionFindFirstOrThrowArgs>(args?: SelectSubset<T, ingredient_transactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ingredient_transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transaction.findMany()
     * 
     * // Get first 10 Ingredient_transactions
     * const ingredient_transactions = await prisma.ingredient_transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ingredient_transactionWithIdOnly = await prisma.ingredient_transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ingredient_transactionFindManyArgs>(args?: SelectSubset<T, ingredient_transactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ingredient_transaction.
     * @param {ingredient_transactionCreateArgs} args - Arguments to create a Ingredient_transaction.
     * @example
     * // Create one Ingredient_transaction
     * const Ingredient_transaction = await prisma.ingredient_transaction.create({
     *   data: {
     *     // ... data to create a Ingredient_transaction
     *   }
     * })
     * 
     */
    create<T extends ingredient_transactionCreateArgs>(args: SelectSubset<T, ingredient_transactionCreateArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ingredient_transactions.
     * @param {ingredient_transactionCreateManyArgs} args - Arguments to create many Ingredient_transactions.
     * @example
     * // Create many Ingredient_transactions
     * const ingredient_transaction = await prisma.ingredient_transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ingredient_transactionCreateManyArgs>(args?: SelectSubset<T, ingredient_transactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ingredient_transaction.
     * @param {ingredient_transactionDeleteArgs} args - Arguments to delete one Ingredient_transaction.
     * @example
     * // Delete one Ingredient_transaction
     * const Ingredient_transaction = await prisma.ingredient_transaction.delete({
     *   where: {
     *     // ... filter to delete one Ingredient_transaction
     *   }
     * })
     * 
     */
    delete<T extends ingredient_transactionDeleteArgs>(args: SelectSubset<T, ingredient_transactionDeleteArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ingredient_transaction.
     * @param {ingredient_transactionUpdateArgs} args - Arguments to update one Ingredient_transaction.
     * @example
     * // Update one Ingredient_transaction
     * const ingredient_transaction = await prisma.ingredient_transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ingredient_transactionUpdateArgs>(args: SelectSubset<T, ingredient_transactionUpdateArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ingredient_transactions.
     * @param {ingredient_transactionDeleteManyArgs} args - Arguments to filter Ingredient_transactions to delete.
     * @example
     * // Delete a few Ingredient_transactions
     * const { count } = await prisma.ingredient_transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ingredient_transactionDeleteManyArgs>(args?: SelectSubset<T, ingredient_transactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredient_transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ingredient_transactions
     * const ingredient_transaction = await prisma.ingredient_transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ingredient_transactionUpdateManyArgs>(args: SelectSubset<T, ingredient_transactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ingredient_transaction.
     * @param {ingredient_transactionUpsertArgs} args - Arguments to update or create a Ingredient_transaction.
     * @example
     * // Update or create a Ingredient_transaction
     * const ingredient_transaction = await prisma.ingredient_transaction.upsert({
     *   create: {
     *     // ... data to create a Ingredient_transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ingredient_transaction we want to update
     *   }
     * })
     */
    upsert<T extends ingredient_transactionUpsertArgs>(args: SelectSubset<T, ingredient_transactionUpsertArgs<ExtArgs>>): Prisma__ingredient_transactionClient<$Result.GetResult<Prisma.$ingredient_transactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ingredient_transactions that matches the filter.
     * @param {ingredient_transactionFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const ingredient_transaction = await prisma.ingredient_transaction.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: ingredient_transactionFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Ingredient_transaction.
     * @param {ingredient_transactionAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const ingredient_transaction = await prisma.ingredient_transaction.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ingredient_transactionAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Ingredient_transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionCountArgs} args - Arguments to filter Ingredient_transactions to count.
     * @example
     * // Count the number of Ingredient_transactions
     * const count = await prisma.ingredient_transaction.count({
     *   where: {
     *     // ... the filter for the Ingredient_transactions we want to count
     *   }
     * })
    **/
    count<T extends ingredient_transactionCountArgs>(
      args?: Subset<T, ingredient_transactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ingredient_transactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ingredient_transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ingredient_transactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ingredient_transactionAggregateArgs>(args: Subset<T, Ingredient_transactionAggregateArgs>): Prisma.PrismaPromise<GetIngredient_transactionAggregateType<T>>

    /**
     * Group by Ingredient_transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ingredient_transactionGroupByArgs} args - Group by arguments.
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
      T extends ingredient_transactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ingredient_transactionGroupByArgs['orderBy'] }
        : { orderBy?: ingredient_transactionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ingredient_transactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngredient_transactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ingredient_transaction model
   */
  readonly fields: ingredient_transactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ingredient_transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ingredient_transactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ingredient_transaction model
   */
  interface ingredient_transactionFieldRefs {
    readonly id: FieldRef<"ingredient_transaction", 'String'>
    readonly ingredient_name: FieldRef<"ingredient_transaction", 'String'>
    readonly transaction_date: FieldRef<"ingredient_transaction", 'String'>
    readonly transaction_from_username: FieldRef<"ingredient_transaction", 'String'>
    readonly transaction_id: FieldRef<"ingredient_transaction", 'Int'>
    readonly transaction_quantity: FieldRef<"ingredient_transaction", 'String'>
    readonly transaction_total_price: FieldRef<"ingredient_transaction", 'String'>
    readonly transaction_type: FieldRef<"ingredient_transaction", 'String'>
    readonly transaction_units: FieldRef<"ingredient_transaction", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ingredient_transaction findUnique
   */
  export type ingredient_transactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transaction to fetch.
     */
    where: ingredient_transactionWhereUniqueInput
  }

  /**
   * ingredient_transaction findUniqueOrThrow
   */
  export type ingredient_transactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transaction to fetch.
     */
    where: ingredient_transactionWhereUniqueInput
  }

  /**
   * ingredient_transaction findFirst
   */
  export type ingredient_transactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transaction to fetch.
     */
    where?: ingredient_transactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionOrderByWithRelationInput | ingredient_transactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ingredient_transactions.
     */
    cursor?: ingredient_transactionWhereUniqueInput
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
    distinct?: Ingredient_transactionScalarFieldEnum | Ingredient_transactionScalarFieldEnum[]
  }

  /**
   * ingredient_transaction findFirstOrThrow
   */
  export type ingredient_transactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transaction to fetch.
     */
    where?: ingredient_transactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionOrderByWithRelationInput | ingredient_transactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ingredient_transactions.
     */
    cursor?: ingredient_transactionWhereUniqueInput
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
    distinct?: Ingredient_transactionScalarFieldEnum | Ingredient_transactionScalarFieldEnum[]
  }

  /**
   * ingredient_transaction findMany
   */
  export type ingredient_transactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * Filter, which ingredient_transactions to fetch.
     */
    where?: ingredient_transactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ingredient_transactions to fetch.
     */
    orderBy?: ingredient_transactionOrderByWithRelationInput | ingredient_transactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ingredient_transactions.
     */
    cursor?: ingredient_transactionWhereUniqueInput
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
    distinct?: Ingredient_transactionScalarFieldEnum | Ingredient_transactionScalarFieldEnum[]
  }

  /**
   * ingredient_transaction create
   */
  export type ingredient_transactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * The data needed to create a ingredient_transaction.
     */
    data: XOR<ingredient_transactionCreateInput, ingredient_transactionUncheckedCreateInput>
  }

  /**
   * ingredient_transaction createMany
   */
  export type ingredient_transactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ingredient_transactions.
     */
    data: ingredient_transactionCreateManyInput | ingredient_transactionCreateManyInput[]
  }

  /**
   * ingredient_transaction update
   */
  export type ingredient_transactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * The data needed to update a ingredient_transaction.
     */
    data: XOR<ingredient_transactionUpdateInput, ingredient_transactionUncheckedUpdateInput>
    /**
     * Choose, which ingredient_transaction to update.
     */
    where: ingredient_transactionWhereUniqueInput
  }

  /**
   * ingredient_transaction updateMany
   */
  export type ingredient_transactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ingredient_transactions.
     */
    data: XOR<ingredient_transactionUpdateManyMutationInput, ingredient_transactionUncheckedUpdateManyInput>
    /**
     * Filter which ingredient_transactions to update
     */
    where?: ingredient_transactionWhereInput
    /**
     * Limit how many ingredient_transactions to update.
     */
    limit?: number
  }

  /**
   * ingredient_transaction upsert
   */
  export type ingredient_transactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * The filter to search for the ingredient_transaction to update in case it exists.
     */
    where: ingredient_transactionWhereUniqueInput
    /**
     * In case the ingredient_transaction found by the `where` argument doesn't exist, create a new ingredient_transaction with this data.
     */
    create: XOR<ingredient_transactionCreateInput, ingredient_transactionUncheckedCreateInput>
    /**
     * In case the ingredient_transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ingredient_transactionUpdateInput, ingredient_transactionUncheckedUpdateInput>
  }

  /**
   * ingredient_transaction delete
   */
  export type ingredient_transactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
    /**
     * Filter which ingredient_transaction to delete.
     */
    where: ingredient_transactionWhereUniqueInput
  }

  /**
   * ingredient_transaction deleteMany
   */
  export type ingredient_transactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ingredient_transactions to delete
     */
    where?: ingredient_transactionWhereInput
    /**
     * Limit how many ingredient_transactions to delete.
     */
    limit?: number
  }

  /**
   * ingredient_transaction findRaw
   */
  export type ingredient_transactionFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ingredient_transaction aggregateRaw
   */
  export type ingredient_transactionAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ingredient_transaction without action
   */
  export type ingredient_transactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ingredient_transaction
     */
    select?: ingredient_transactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ingredient_transaction
     */
    omit?: ingredient_transactionOmit<ExtArgs> | null
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
  }

  export type IngredientsSumAggregateOutputType = {
    ingredient_id: number | null
  }

  export type IngredientsMinAggregateOutputType = {
    id: string | null
    ingredient_category: string | null
    ingredient_id: number | null
    ingredient_image: string | null
    ingredient_lastupdate: string | null
    ingredient_name: string | null
    ingredient_price: string | null
    ingredient_price_per_unit: string | null
    ingredient_sub_category: string | null
    ingredient_total: string | null
    ingredient_total_alert: string | null
    ingredient_unit: string | null
  }

  export type IngredientsMaxAggregateOutputType = {
    id: string | null
    ingredient_category: string | null
    ingredient_id: number | null
    ingredient_image: string | null
    ingredient_lastupdate: string | null
    ingredient_name: string | null
    ingredient_price: string | null
    ingredient_price_per_unit: string | null
    ingredient_sub_category: string | null
    ingredient_total: string | null
    ingredient_total_alert: string | null
    ingredient_unit: string | null
  }

  export type IngredientsCountAggregateOutputType = {
    id: number
    ingredient_category: number
    ingredient_id: number
    ingredient_image: number
    ingredient_lastupdate: number
    ingredient_name: number
    ingredient_price: number
    ingredient_price_per_unit: number
    ingredient_sub_category: number
    ingredient_total: number
    ingredient_total_alert: number
    ingredient_unit: number
    _all: number
  }


  export type IngredientsAvgAggregateInputType = {
    ingredient_id?: true
  }

  export type IngredientsSumAggregateInputType = {
    ingredient_id?: true
  }

  export type IngredientsMinAggregateInputType = {
    id?: true
    ingredient_category?: true
    ingredient_id?: true
    ingredient_image?: true
    ingredient_lastupdate?: true
    ingredient_name?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
    ingredient_sub_category?: true
    ingredient_total?: true
    ingredient_total_alert?: true
    ingredient_unit?: true
  }

  export type IngredientsMaxAggregateInputType = {
    id?: true
    ingredient_category?: true
    ingredient_id?: true
    ingredient_image?: true
    ingredient_lastupdate?: true
    ingredient_name?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
    ingredient_sub_category?: true
    ingredient_total?: true
    ingredient_total_alert?: true
    ingredient_unit?: true
  }

  export type IngredientsCountAggregateInputType = {
    id?: true
    ingredient_category?: true
    ingredient_id?: true
    ingredient_image?: true
    ingredient_lastupdate?: true
    ingredient_name?: true
    ingredient_price?: true
    ingredient_price_per_unit?: true
    ingredient_sub_category?: true
    ingredient_total?: true
    ingredient_total_alert?: true
    ingredient_unit?: true
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
    id: string
    ingredient_category: string
    ingredient_id: number
    ingredient_image: string
    ingredient_lastupdate: string
    ingredient_name: string
    ingredient_price: string
    ingredient_price_per_unit: string
    ingredient_sub_category: string
    ingredient_total: string
    ingredient_total_alert: string
    ingredient_unit: string
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
    id?: boolean
    ingredient_category?: boolean
    ingredient_id?: boolean
    ingredient_image?: boolean
    ingredient_lastupdate?: boolean
    ingredient_name?: boolean
    ingredient_price?: boolean
    ingredient_price_per_unit?: boolean
    ingredient_sub_category?: boolean
    ingredient_total?: boolean
    ingredient_total_alert?: boolean
    ingredient_unit?: boolean
  }, ExtArgs["result"]["ingredients"]>



  export type ingredientsSelectScalar = {
    id?: boolean
    ingredient_category?: boolean
    ingredient_id?: boolean
    ingredient_image?: boolean
    ingredient_lastupdate?: boolean
    ingredient_name?: boolean
    ingredient_price?: boolean
    ingredient_price_per_unit?: boolean
    ingredient_sub_category?: boolean
    ingredient_total?: boolean
    ingredient_total_alert?: boolean
    ingredient_unit?: boolean
  }

  export type ingredientsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ingredient_category" | "ingredient_id" | "ingredient_image" | "ingredient_lastupdate" | "ingredient_name" | "ingredient_price" | "ingredient_price_per_unit" | "ingredient_sub_category" | "ingredient_total" | "ingredient_total_alert" | "ingredient_unit", ExtArgs["result"]["ingredients"]>

  export type $ingredientsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ingredients"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ingredient_category: string
      ingredient_id: number
      ingredient_image: string
      ingredient_lastupdate: string
      ingredient_name: string
      ingredient_price: string
      ingredient_price_per_unit: string
      ingredient_sub_category: string
      ingredient_total: string
      ingredient_total_alert: string
      ingredient_unit: string
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
     * // Only select the `id`
     * const ingredientsWithIdOnly = await prisma.ingredients.findMany({ select: { id: true } })
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
     * Find zero or more Ingredients that matches the filter.
     * @param {ingredientsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const ingredients = await prisma.ingredients.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: ingredientsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Ingredients.
     * @param {ingredientsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const ingredients = await prisma.ingredients.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: ingredientsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


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
    readonly id: FieldRef<"ingredients", 'String'>
    readonly ingredient_category: FieldRef<"ingredients", 'String'>
    readonly ingredient_id: FieldRef<"ingredients", 'Int'>
    readonly ingredient_image: FieldRef<"ingredients", 'String'>
    readonly ingredient_lastupdate: FieldRef<"ingredients", 'String'>
    readonly ingredient_name: FieldRef<"ingredients", 'String'>
    readonly ingredient_price: FieldRef<"ingredients", 'String'>
    readonly ingredient_price_per_unit: FieldRef<"ingredients", 'String'>
    readonly ingredient_sub_category: FieldRef<"ingredients", 'String'>
    readonly ingredient_total: FieldRef<"ingredients", 'String'>
    readonly ingredient_total_alert: FieldRef<"ingredients", 'String'>
    readonly ingredient_unit: FieldRef<"ingredients", 'String'>
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
   * ingredients findRaw
   */
  export type ingredientsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * ingredients aggregateRaw
   */
  export type ingredientsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
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
   * Model lunchbox
   */

  export type AggregateLunchbox = {
    _count: LunchboxCountAggregateOutputType | null
    _avg: LunchboxAvgAggregateOutputType | null
    _sum: LunchboxSumAggregateOutputType | null
    _min: LunchboxMinAggregateOutputType | null
    _max: LunchboxMaxAggregateOutputType | null
  }

  export type LunchboxAvgAggregateOutputType = {
    lunchbox_limit: number | null
  }

  export type LunchboxSumAggregateOutputType = {
    lunchbox_limit: number | null
  }

  export type LunchboxMinAggregateOutputType = {
    id: string | null
    lunchbox_limit: number | null
    lunchbox_name: string | null
    lunchbox_set_name: string | null
  }

  export type LunchboxMaxAggregateOutputType = {
    id: string | null
    lunchbox_limit: number | null
    lunchbox_name: string | null
    lunchbox_set_name: string | null
  }

  export type LunchboxCountAggregateOutputType = {
    id: number
    lunchbox_limit: number
    lunchbox_name: number
    lunchbox_set_name: number
    _all: number
  }


  export type LunchboxAvgAggregateInputType = {
    lunchbox_limit?: true
  }

  export type LunchboxSumAggregateInputType = {
    lunchbox_limit?: true
  }

  export type LunchboxMinAggregateInputType = {
    id?: true
    lunchbox_limit?: true
    lunchbox_name?: true
    lunchbox_set_name?: true
  }

  export type LunchboxMaxAggregateInputType = {
    id?: true
    lunchbox_limit?: true
    lunchbox_name?: true
    lunchbox_set_name?: true
  }

  export type LunchboxCountAggregateInputType = {
    id?: true
    lunchbox_limit?: true
    lunchbox_name?: true
    lunchbox_set_name?: true
    _all?: true
  }

  export type LunchboxAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which lunchbox to aggregate.
     */
    where?: lunchboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of lunchboxes to fetch.
     */
    orderBy?: lunchboxOrderByWithRelationInput | lunchboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: lunchboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` lunchboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` lunchboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned lunchboxes
    **/
    _count?: true | LunchboxCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LunchboxAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LunchboxSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LunchboxMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LunchboxMaxAggregateInputType
  }

  export type GetLunchboxAggregateType<T extends LunchboxAggregateArgs> = {
        [P in keyof T & keyof AggregateLunchbox]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLunchbox[P]>
      : GetScalarType<T[P], AggregateLunchbox[P]>
  }




  export type lunchboxGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: lunchboxWhereInput
    orderBy?: lunchboxOrderByWithAggregationInput | lunchboxOrderByWithAggregationInput[]
    by: LunchboxScalarFieldEnum[] | LunchboxScalarFieldEnum
    having?: lunchboxScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LunchboxCountAggregateInputType | true
    _avg?: LunchboxAvgAggregateInputType
    _sum?: LunchboxSumAggregateInputType
    _min?: LunchboxMinAggregateInputType
    _max?: LunchboxMaxAggregateInputType
  }

  export type LunchboxGroupByOutputType = {
    id: string
    lunchbox_limit: number
    lunchbox_name: string
    lunchbox_set_name: string
    _count: LunchboxCountAggregateOutputType | null
    _avg: LunchboxAvgAggregateOutputType | null
    _sum: LunchboxSumAggregateOutputType | null
    _min: LunchboxMinAggregateOutputType | null
    _max: LunchboxMaxAggregateOutputType | null
  }

  type GetLunchboxGroupByPayload<T extends lunchboxGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LunchboxGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LunchboxGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LunchboxGroupByOutputType[P]>
            : GetScalarType<T[P], LunchboxGroupByOutputType[P]>
        }
      >
    >


  export type lunchboxSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lunchbox_limit?: boolean
    lunchbox_name?: boolean
    lunchbox_set_name?: boolean
  }, ExtArgs["result"]["lunchbox"]>



  export type lunchboxSelectScalar = {
    id?: boolean
    lunchbox_limit?: boolean
    lunchbox_name?: boolean
    lunchbox_set_name?: boolean
  }

  export type lunchboxOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "lunchbox_limit" | "lunchbox_name" | "lunchbox_set_name", ExtArgs["result"]["lunchbox"]>

  export type $lunchboxPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "lunchbox"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      lunchbox_limit: number
      lunchbox_name: string
      lunchbox_set_name: string
    }, ExtArgs["result"]["lunchbox"]>
    composites: {}
  }

  type lunchboxGetPayload<S extends boolean | null | undefined | lunchboxDefaultArgs> = $Result.GetResult<Prisma.$lunchboxPayload, S>

  type lunchboxCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<lunchboxFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LunchboxCountAggregateInputType | true
    }

  export interface lunchboxDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['lunchbox'], meta: { name: 'lunchbox' } }
    /**
     * Find zero or one Lunchbox that matches the filter.
     * @param {lunchboxFindUniqueArgs} args - Arguments to find a Lunchbox
     * @example
     * // Get one Lunchbox
     * const lunchbox = await prisma.lunchbox.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends lunchboxFindUniqueArgs>(args: SelectSubset<T, lunchboxFindUniqueArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Lunchbox that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {lunchboxFindUniqueOrThrowArgs} args - Arguments to find a Lunchbox
     * @example
     * // Get one Lunchbox
     * const lunchbox = await prisma.lunchbox.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends lunchboxFindUniqueOrThrowArgs>(args: SelectSubset<T, lunchboxFindUniqueOrThrowArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lunchbox that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {lunchboxFindFirstArgs} args - Arguments to find a Lunchbox
     * @example
     * // Get one Lunchbox
     * const lunchbox = await prisma.lunchbox.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends lunchboxFindFirstArgs>(args?: SelectSubset<T, lunchboxFindFirstArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Lunchbox that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {lunchboxFindFirstOrThrowArgs} args - Arguments to find a Lunchbox
     * @example
     * // Get one Lunchbox
     * const lunchbox = await prisma.lunchbox.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends lunchboxFindFirstOrThrowArgs>(args?: SelectSubset<T, lunchboxFindFirstOrThrowArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Lunchboxes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {lunchboxFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Lunchboxes
     * const lunchboxes = await prisma.lunchbox.findMany()
     * 
     * // Get first 10 Lunchboxes
     * const lunchboxes = await prisma.lunchbox.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lunchboxWithIdOnly = await prisma.lunchbox.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends lunchboxFindManyArgs>(args?: SelectSubset<T, lunchboxFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Lunchbox.
     * @param {lunchboxCreateArgs} args - Arguments to create a Lunchbox.
     * @example
     * // Create one Lunchbox
     * const Lunchbox = await prisma.lunchbox.create({
     *   data: {
     *     // ... data to create a Lunchbox
     *   }
     * })
     * 
     */
    create<T extends lunchboxCreateArgs>(args: SelectSubset<T, lunchboxCreateArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Lunchboxes.
     * @param {lunchboxCreateManyArgs} args - Arguments to create many Lunchboxes.
     * @example
     * // Create many Lunchboxes
     * const lunchbox = await prisma.lunchbox.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends lunchboxCreateManyArgs>(args?: SelectSubset<T, lunchboxCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Lunchbox.
     * @param {lunchboxDeleteArgs} args - Arguments to delete one Lunchbox.
     * @example
     * // Delete one Lunchbox
     * const Lunchbox = await prisma.lunchbox.delete({
     *   where: {
     *     // ... filter to delete one Lunchbox
     *   }
     * })
     * 
     */
    delete<T extends lunchboxDeleteArgs>(args: SelectSubset<T, lunchboxDeleteArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Lunchbox.
     * @param {lunchboxUpdateArgs} args - Arguments to update one Lunchbox.
     * @example
     * // Update one Lunchbox
     * const lunchbox = await prisma.lunchbox.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends lunchboxUpdateArgs>(args: SelectSubset<T, lunchboxUpdateArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Lunchboxes.
     * @param {lunchboxDeleteManyArgs} args - Arguments to filter Lunchboxes to delete.
     * @example
     * // Delete a few Lunchboxes
     * const { count } = await prisma.lunchbox.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends lunchboxDeleteManyArgs>(args?: SelectSubset<T, lunchboxDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lunchboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {lunchboxUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Lunchboxes
     * const lunchbox = await prisma.lunchbox.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends lunchboxUpdateManyArgs>(args: SelectSubset<T, lunchboxUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Lunchbox.
     * @param {lunchboxUpsertArgs} args - Arguments to update or create a Lunchbox.
     * @example
     * // Update or create a Lunchbox
     * const lunchbox = await prisma.lunchbox.upsert({
     *   create: {
     *     // ... data to create a Lunchbox
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lunchbox we want to update
     *   }
     * })
     */
    upsert<T extends lunchboxUpsertArgs>(args: SelectSubset<T, lunchboxUpsertArgs<ExtArgs>>): Prisma__lunchboxClient<$Result.GetResult<Prisma.$lunchboxPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Lunchboxes that matches the filter.
     * @param {lunchboxFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const lunchbox = await prisma.lunchbox.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: lunchboxFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Lunchbox.
     * @param {lunchboxAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const lunchbox = await prisma.lunchbox.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: lunchboxAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Lunchboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {lunchboxCountArgs} args - Arguments to filter Lunchboxes to count.
     * @example
     * // Count the number of Lunchboxes
     * const count = await prisma.lunchbox.count({
     *   where: {
     *     // ... the filter for the Lunchboxes we want to count
     *   }
     * })
    **/
    count<T extends lunchboxCountArgs>(
      args?: Subset<T, lunchboxCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LunchboxCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lunchbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LunchboxAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LunchboxAggregateArgs>(args: Subset<T, LunchboxAggregateArgs>): Prisma.PrismaPromise<GetLunchboxAggregateType<T>>

    /**
     * Group by Lunchbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {lunchboxGroupByArgs} args - Group by arguments.
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
      T extends lunchboxGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: lunchboxGroupByArgs['orderBy'] }
        : { orderBy?: lunchboxGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, lunchboxGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLunchboxGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the lunchbox model
   */
  readonly fields: lunchboxFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for lunchbox.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__lunchboxClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the lunchbox model
   */
  interface lunchboxFieldRefs {
    readonly id: FieldRef<"lunchbox", 'String'>
    readonly lunchbox_limit: FieldRef<"lunchbox", 'Int'>
    readonly lunchbox_name: FieldRef<"lunchbox", 'String'>
    readonly lunchbox_set_name: FieldRef<"lunchbox", 'String'>
  }
    

  // Custom InputTypes
  /**
   * lunchbox findUnique
   */
  export type lunchboxFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * Filter, which lunchbox to fetch.
     */
    where: lunchboxWhereUniqueInput
  }

  /**
   * lunchbox findUniqueOrThrow
   */
  export type lunchboxFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * Filter, which lunchbox to fetch.
     */
    where: lunchboxWhereUniqueInput
  }

  /**
   * lunchbox findFirst
   */
  export type lunchboxFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * Filter, which lunchbox to fetch.
     */
    where?: lunchboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of lunchboxes to fetch.
     */
    orderBy?: lunchboxOrderByWithRelationInput | lunchboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for lunchboxes.
     */
    cursor?: lunchboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` lunchboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` lunchboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of lunchboxes.
     */
    distinct?: LunchboxScalarFieldEnum | LunchboxScalarFieldEnum[]
  }

  /**
   * lunchbox findFirstOrThrow
   */
  export type lunchboxFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * Filter, which lunchbox to fetch.
     */
    where?: lunchboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of lunchboxes to fetch.
     */
    orderBy?: lunchboxOrderByWithRelationInput | lunchboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for lunchboxes.
     */
    cursor?: lunchboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` lunchboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` lunchboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of lunchboxes.
     */
    distinct?: LunchboxScalarFieldEnum | LunchboxScalarFieldEnum[]
  }

  /**
   * lunchbox findMany
   */
  export type lunchboxFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * Filter, which lunchboxes to fetch.
     */
    where?: lunchboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of lunchboxes to fetch.
     */
    orderBy?: lunchboxOrderByWithRelationInput | lunchboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing lunchboxes.
     */
    cursor?: lunchboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` lunchboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` lunchboxes.
     */
    skip?: number
    distinct?: LunchboxScalarFieldEnum | LunchboxScalarFieldEnum[]
  }

  /**
   * lunchbox create
   */
  export type lunchboxCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * The data needed to create a lunchbox.
     */
    data: XOR<lunchboxCreateInput, lunchboxUncheckedCreateInput>
  }

  /**
   * lunchbox createMany
   */
  export type lunchboxCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many lunchboxes.
     */
    data: lunchboxCreateManyInput | lunchboxCreateManyInput[]
  }

  /**
   * lunchbox update
   */
  export type lunchboxUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * The data needed to update a lunchbox.
     */
    data: XOR<lunchboxUpdateInput, lunchboxUncheckedUpdateInput>
    /**
     * Choose, which lunchbox to update.
     */
    where: lunchboxWhereUniqueInput
  }

  /**
   * lunchbox updateMany
   */
  export type lunchboxUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update lunchboxes.
     */
    data: XOR<lunchboxUpdateManyMutationInput, lunchboxUncheckedUpdateManyInput>
    /**
     * Filter which lunchboxes to update
     */
    where?: lunchboxWhereInput
    /**
     * Limit how many lunchboxes to update.
     */
    limit?: number
  }

  /**
   * lunchbox upsert
   */
  export type lunchboxUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * The filter to search for the lunchbox to update in case it exists.
     */
    where: lunchboxWhereUniqueInput
    /**
     * In case the lunchbox found by the `where` argument doesn't exist, create a new lunchbox with this data.
     */
    create: XOR<lunchboxCreateInput, lunchboxUncheckedCreateInput>
    /**
     * In case the lunchbox was found with the provided `where` argument, update it with this data.
     */
    update: XOR<lunchboxUpdateInput, lunchboxUncheckedUpdateInput>
  }

  /**
   * lunchbox delete
   */
  export type lunchboxDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
    /**
     * Filter which lunchbox to delete.
     */
    where: lunchboxWhereUniqueInput
  }

  /**
   * lunchbox deleteMany
   */
  export type lunchboxDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which lunchboxes to delete
     */
    where?: lunchboxWhereInput
    /**
     * Limit how many lunchboxes to delete.
     */
    limit?: number
  }

  /**
   * lunchbox findRaw
   */
  export type lunchboxFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * lunchbox aggregateRaw
   */
  export type lunchboxAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * lunchbox without action
   */
  export type lunchboxDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the lunchbox
     */
    select?: lunchboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the lunchbox
     */
    omit?: lunchboxOmit<ExtArgs> | null
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
  }

  export type MenuSumAggregateOutputType = {
    menu_id: number | null
  }

  export type MenuMinAggregateOutputType = {
    id: string | null
    menu_category: string | null
    menu_id: number | null
    menu_image: string | null
    menu_name: string | null
    menu_subname: string | null
  }

  export type MenuMaxAggregateOutputType = {
    id: string | null
    menu_category: string | null
    menu_id: number | null
    menu_image: string | null
    menu_name: string | null
    menu_subname: string | null
  }

  export type MenuCountAggregateOutputType = {
    id: number
    menu_category: number
    menu_cost: number
    menu_id: number
    menu_image: number
    menu_name: number
    menu_subname: number
    _all: number
  }


  export type MenuAvgAggregateInputType = {
    menu_id?: true
  }

  export type MenuSumAggregateInputType = {
    menu_id?: true
  }

  export type MenuMinAggregateInputType = {
    id?: true
    menu_category?: true
    menu_id?: true
    menu_image?: true
    menu_name?: true
    menu_subname?: true
  }

  export type MenuMaxAggregateInputType = {
    id?: true
    menu_category?: true
    menu_id?: true
    menu_image?: true
    menu_name?: true
    menu_subname?: true
  }

  export type MenuCountAggregateInputType = {
    id?: true
    menu_category?: true
    menu_cost?: true
    menu_id?: true
    menu_image?: true
    menu_name?: true
    menu_subname?: true
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
    id: string
    menu_category: string
    menu_cost: JsonValue
    menu_id: number
    menu_image: string
    menu_name: string
    menu_subname: string
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
    id?: boolean
    menu_category?: boolean
    menu_cost?: boolean
    menu_id?: boolean
    menu_image?: boolean
    menu_ingredients?: boolean | MenuMenuIngredientsDefaultArgs<ExtArgs>
    menu_lunchbox?: boolean | MenuMenuLunchboxDefaultArgs<ExtArgs>
    menu_name?: boolean
    menu_subname?: boolean
  }, ExtArgs["result"]["menu"]>



  export type menuSelectScalar = {
    id?: boolean
    menu_category?: boolean
    menu_cost?: boolean
    menu_id?: boolean
    menu_image?: boolean
    menu_name?: boolean
    menu_subname?: boolean
  }

  export type menuOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "menu_category" | "menu_cost" | "menu_id" | "menu_image" | "menu_ingredients" | "menu_lunchbox" | "menu_name" | "menu_subname", ExtArgs["result"]["menu"]>
  export type menuInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $menuPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "menu"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      menu_category: string
      /**
       * Multiple data types found: Int: 99.1%, BigInt: 0.9% out of 110 sampled entries
       */
      menu_cost: Prisma.JsonValue
      menu_id: number
      menu_image: string
      menu_name: string
      menu_subname: string
    }, ExtArgs["result"]["menu"]>
    composites: {
      menu_ingredients: Prisma.$MenuMenuIngredientsPayload[]
      menu_lunchbox: Prisma.$MenuMenuLunchboxPayload[]
    }
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
     * // Only select the `id`
     * const menuWithIdOnly = await prisma.menu.findMany({ select: { id: true } })
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
     * Find zero or more Menus that matches the filter.
     * @param {menuFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const menu = await prisma.menu.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: menuFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Menu.
     * @param {menuAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const menu = await prisma.menu.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: menuAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


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
    readonly id: FieldRef<"menu", 'String'>
    readonly menu_category: FieldRef<"menu", 'String'>
    readonly menu_cost: FieldRef<"menu", 'Json'>
    readonly menu_id: FieldRef<"menu", 'Int'>
    readonly menu_image: FieldRef<"menu", 'String'>
    readonly menu_name: FieldRef<"menu", 'String'>
    readonly menu_subname: FieldRef<"menu", 'String'>
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
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
   * menu findRaw
   */
  export type menuFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * menu aggregateRaw
   */
  export type menuAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: menuInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const CartScalarFieldEnum: {
    id: 'id',
    cart_create_date: 'cart_create_date',
    cart_customer_name: 'cart_customer_name',
    cart_customer_tel: 'cart_customer_tel',
    cart_delivery_date: 'cart_delivery_date',
    cart_export_time: 'cart_export_time',
    cart_id: 'cart_id',
    cart_last_update: 'cart_last_update',
    cart_location_send: 'cart_location_send',
    cart_order_number: 'cart_order_number',
    cart_receive_time: 'cart_receive_time',
    cart_shipping_cost: 'cart_shipping_cost',
    cart_status: 'cart_status',
    cart_username: 'cart_username'
  };

  export type CartScalarFieldEnum = (typeof CartScalarFieldEnum)[keyof typeof CartScalarFieldEnum]


  export const EmployeeScalarFieldEnum: {
    id: 'id',
    employee_firstname: 'employee_firstname',
    employee_id: 'employee_id',
    employee_lastname: 'employee_lastname',
    employee_pin: 'employee_pin',
    employee_role: 'employee_role',
    employee_username: 'employee_username'
  };

  export type EmployeeScalarFieldEnum = (typeof EmployeeScalarFieldEnum)[keyof typeof EmployeeScalarFieldEnum]


  export const Ingredient_transactionScalarFieldEnum: {
    id: 'id',
    ingredient_name: 'ingredient_name',
    transaction_date: 'transaction_date',
    transaction_from_username: 'transaction_from_username',
    transaction_id: 'transaction_id',
    transaction_quantity: 'transaction_quantity',
    transaction_total_price: 'transaction_total_price',
    transaction_type: 'transaction_type',
    transaction_units: 'transaction_units'
  };

  export type Ingredient_transactionScalarFieldEnum = (typeof Ingredient_transactionScalarFieldEnum)[keyof typeof Ingredient_transactionScalarFieldEnum]


  export const IngredientsScalarFieldEnum: {
    id: 'id',
    ingredient_category: 'ingredient_category',
    ingredient_id: 'ingredient_id',
    ingredient_image: 'ingredient_image',
    ingredient_lastupdate: 'ingredient_lastupdate',
    ingredient_name: 'ingredient_name',
    ingredient_price: 'ingredient_price',
    ingredient_price_per_unit: 'ingredient_price_per_unit',
    ingredient_sub_category: 'ingredient_sub_category',
    ingredient_total: 'ingredient_total',
    ingredient_total_alert: 'ingredient_total_alert',
    ingredient_unit: 'ingredient_unit'
  };

  export type IngredientsScalarFieldEnum = (typeof IngredientsScalarFieldEnum)[keyof typeof IngredientsScalarFieldEnum]


  export const LunchboxScalarFieldEnum: {
    id: 'id',
    lunchbox_limit: 'lunchbox_limit',
    lunchbox_name: 'lunchbox_name',
    lunchbox_set_name: 'lunchbox_set_name'
  };

  export type LunchboxScalarFieldEnum = (typeof LunchboxScalarFieldEnum)[keyof typeof LunchboxScalarFieldEnum]


  export const MenuScalarFieldEnum: {
    id: 'id',
    menu_category: 'menu_category',
    menu_cost: 'menu_cost',
    menu_id: 'menu_id',
    menu_image: 'menu_image',
    menu_name: 'menu_name',
    menu_subname: 'menu_subname'
  };

  export type MenuScalarFieldEnum = (typeof MenuScalarFieldEnum)[keyof typeof MenuScalarFieldEnum]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type cartWhereInput = {
    AND?: cartWhereInput | cartWhereInput[]
    OR?: cartWhereInput[]
    NOT?: cartWhereInput | cartWhereInput[]
    id?: StringFilter<"cart"> | string
    cart_create_date?: StringFilter<"cart"> | string
    cart_customer_name?: StringFilter<"cart"> | string
    cart_customer_tel?: StringFilter<"cart"> | string
    cart_delivery_date?: StringFilter<"cart"> | string
    cart_export_time?: StringFilter<"cart"> | string
    cart_id?: StringFilter<"cart"> | string
    cart_last_update?: StringNullableFilter<"cart"> | string | null
    cart_location_send?: StringFilter<"cart"> | string
    cart_lunchbox?: CartCartLunchboxCompositeListFilter | CartCartLunchboxObjectEqualityInput[]
    cart_menu_items?: CartCartMenuItemsCompositeListFilter | CartCartMenuItemsObjectEqualityInput[]
    cart_order_number?: StringFilter<"cart"> | string
    cart_receive_time?: StringFilter<"cart"> | string
    cart_shipping_cost?: StringFilter<"cart"> | string
    cart_status?: StringFilter<"cart"> | string
    cart_username?: StringFilter<"cart"> | string
  }

  export type cartOrderByWithRelationInput = {
    id?: SortOrder
    cart_create_date?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_id?: SortOrder
    cart_last_update?: SortOrder
    cart_location_send?: SortOrder
    cart_lunchbox?: CartCartLunchboxOrderByCompositeAggregateInput
    cart_menu_items?: CartCartMenuItemsOrderByCompositeAggregateInput
    cart_order_number?: SortOrder
    cart_receive_time?: SortOrder
    cart_shipping_cost?: SortOrder
    cart_status?: SortOrder
    cart_username?: SortOrder
  }

  export type cartWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: cartWhereInput | cartWhereInput[]
    OR?: cartWhereInput[]
    NOT?: cartWhereInput | cartWhereInput[]
    cart_create_date?: StringFilter<"cart"> | string
    cart_customer_name?: StringFilter<"cart"> | string
    cart_customer_tel?: StringFilter<"cart"> | string
    cart_delivery_date?: StringFilter<"cart"> | string
    cart_export_time?: StringFilter<"cart"> | string
    cart_id?: StringFilter<"cart"> | string
    cart_last_update?: StringNullableFilter<"cart"> | string | null
    cart_location_send?: StringFilter<"cart"> | string
    cart_lunchbox?: CartCartLunchboxCompositeListFilter | CartCartLunchboxObjectEqualityInput[]
    cart_menu_items?: CartCartMenuItemsCompositeListFilter | CartCartMenuItemsObjectEqualityInput[]
    cart_order_number?: StringFilter<"cart"> | string
    cart_receive_time?: StringFilter<"cart"> | string
    cart_shipping_cost?: StringFilter<"cart"> | string
    cart_status?: StringFilter<"cart"> | string
    cart_username?: StringFilter<"cart"> | string
  }, "id">

  export type cartOrderByWithAggregationInput = {
    id?: SortOrder
    cart_create_date?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_id?: SortOrder
    cart_last_update?: SortOrder
    cart_location_send?: SortOrder
    cart_order_number?: SortOrder
    cart_receive_time?: SortOrder
    cart_shipping_cost?: SortOrder
    cart_status?: SortOrder
    cart_username?: SortOrder
    _count?: cartCountOrderByAggregateInput
    _max?: cartMaxOrderByAggregateInput
    _min?: cartMinOrderByAggregateInput
  }

  export type cartScalarWhereWithAggregatesInput = {
    AND?: cartScalarWhereWithAggregatesInput | cartScalarWhereWithAggregatesInput[]
    OR?: cartScalarWhereWithAggregatesInput[]
    NOT?: cartScalarWhereWithAggregatesInput | cartScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"cart"> | string
    cart_create_date?: StringWithAggregatesFilter<"cart"> | string
    cart_customer_name?: StringWithAggregatesFilter<"cart"> | string
    cart_customer_tel?: StringWithAggregatesFilter<"cart"> | string
    cart_delivery_date?: StringWithAggregatesFilter<"cart"> | string
    cart_export_time?: StringWithAggregatesFilter<"cart"> | string
    cart_id?: StringWithAggregatesFilter<"cart"> | string
    cart_last_update?: StringNullableWithAggregatesFilter<"cart"> | string | null
    cart_location_send?: StringWithAggregatesFilter<"cart"> | string
    cart_order_number?: StringWithAggregatesFilter<"cart"> | string
    cart_receive_time?: StringWithAggregatesFilter<"cart"> | string
    cart_shipping_cost?: StringWithAggregatesFilter<"cart"> | string
    cart_status?: StringWithAggregatesFilter<"cart"> | string
    cart_username?: StringWithAggregatesFilter<"cart"> | string
  }

  export type employeeWhereInput = {
    AND?: employeeWhereInput | employeeWhereInput[]
    OR?: employeeWhereInput[]
    NOT?: employeeWhereInput | employeeWhereInput[]
    id?: StringFilter<"employee"> | string
    employee_firstname?: StringFilter<"employee"> | string
    employee_id?: StringFilter<"employee"> | string
    employee_lastname?: StringFilter<"employee"> | string
    employee_pin?: StringFilter<"employee"> | string
    employee_role?: StringFilter<"employee"> | string
    employee_username?: StringFilter<"employee"> | string
  }

  export type employeeOrderByWithRelationInput = {
    id?: SortOrder
    employee_firstname?: SortOrder
    employee_id?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
    employee_username?: SortOrder
  }

  export type employeeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: employeeWhereInput | employeeWhereInput[]
    OR?: employeeWhereInput[]
    NOT?: employeeWhereInput | employeeWhereInput[]
    employee_firstname?: StringFilter<"employee"> | string
    employee_id?: StringFilter<"employee"> | string
    employee_lastname?: StringFilter<"employee"> | string
    employee_pin?: StringFilter<"employee"> | string
    employee_role?: StringFilter<"employee"> | string
    employee_username?: StringFilter<"employee"> | string
  }, "id">

  export type employeeOrderByWithAggregationInput = {
    id?: SortOrder
    employee_firstname?: SortOrder
    employee_id?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
    employee_username?: SortOrder
    _count?: employeeCountOrderByAggregateInput
    _max?: employeeMaxOrderByAggregateInput
    _min?: employeeMinOrderByAggregateInput
  }

  export type employeeScalarWhereWithAggregatesInput = {
    AND?: employeeScalarWhereWithAggregatesInput | employeeScalarWhereWithAggregatesInput[]
    OR?: employeeScalarWhereWithAggregatesInput[]
    NOT?: employeeScalarWhereWithAggregatesInput | employeeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"employee"> | string
    employee_firstname?: StringWithAggregatesFilter<"employee"> | string
    employee_id?: StringWithAggregatesFilter<"employee"> | string
    employee_lastname?: StringWithAggregatesFilter<"employee"> | string
    employee_pin?: StringWithAggregatesFilter<"employee"> | string
    employee_role?: StringWithAggregatesFilter<"employee"> | string
    employee_username?: StringWithAggregatesFilter<"employee"> | string
  }

  export type ingredient_transactionWhereInput = {
    AND?: ingredient_transactionWhereInput | ingredient_transactionWhereInput[]
    OR?: ingredient_transactionWhereInput[]
    NOT?: ingredient_transactionWhereInput | ingredient_transactionWhereInput[]
    id?: StringFilter<"ingredient_transaction"> | string
    ingredient_name?: StringFilter<"ingredient_transaction"> | string
    transaction_date?: StringFilter<"ingredient_transaction"> | string
    transaction_from_username?: StringFilter<"ingredient_transaction"> | string
    transaction_id?: IntFilter<"ingredient_transaction"> | number
    transaction_quantity?: StringFilter<"ingredient_transaction"> | string
    transaction_total_price?: StringFilter<"ingredient_transaction"> | string
    transaction_type?: StringFilter<"ingredient_transaction"> | string
    transaction_units?: StringFilter<"ingredient_transaction"> | string
  }

  export type ingredient_transactionOrderByWithRelationInput = {
    id?: SortOrder
    ingredient_name?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_id?: SortOrder
    transaction_quantity?: SortOrder
    transaction_total_price?: SortOrder
    transaction_type?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ingredient_transactionWhereInput | ingredient_transactionWhereInput[]
    OR?: ingredient_transactionWhereInput[]
    NOT?: ingredient_transactionWhereInput | ingredient_transactionWhereInput[]
    ingredient_name?: StringFilter<"ingredient_transaction"> | string
    transaction_date?: StringFilter<"ingredient_transaction"> | string
    transaction_from_username?: StringFilter<"ingredient_transaction"> | string
    transaction_id?: IntFilter<"ingredient_transaction"> | number
    transaction_quantity?: StringFilter<"ingredient_transaction"> | string
    transaction_total_price?: StringFilter<"ingredient_transaction"> | string
    transaction_type?: StringFilter<"ingredient_transaction"> | string
    transaction_units?: StringFilter<"ingredient_transaction"> | string
  }, "id">

  export type ingredient_transactionOrderByWithAggregationInput = {
    id?: SortOrder
    ingredient_name?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_id?: SortOrder
    transaction_quantity?: SortOrder
    transaction_total_price?: SortOrder
    transaction_type?: SortOrder
    transaction_units?: SortOrder
    _count?: ingredient_transactionCountOrderByAggregateInput
    _avg?: ingredient_transactionAvgOrderByAggregateInput
    _max?: ingredient_transactionMaxOrderByAggregateInput
    _min?: ingredient_transactionMinOrderByAggregateInput
    _sum?: ingredient_transactionSumOrderByAggregateInput
  }

  export type ingredient_transactionScalarWhereWithAggregatesInput = {
    AND?: ingredient_transactionScalarWhereWithAggregatesInput | ingredient_transactionScalarWhereWithAggregatesInput[]
    OR?: ingredient_transactionScalarWhereWithAggregatesInput[]
    NOT?: ingredient_transactionScalarWhereWithAggregatesInput | ingredient_transactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    ingredient_name?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    transaction_date?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    transaction_from_username?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    transaction_id?: IntWithAggregatesFilter<"ingredient_transaction"> | number
    transaction_quantity?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    transaction_total_price?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    transaction_type?: StringWithAggregatesFilter<"ingredient_transaction"> | string
    transaction_units?: StringWithAggregatesFilter<"ingredient_transaction"> | string
  }

  export type ingredientsWhereInput = {
    AND?: ingredientsWhereInput | ingredientsWhereInput[]
    OR?: ingredientsWhereInput[]
    NOT?: ingredientsWhereInput | ingredientsWhereInput[]
    id?: StringFilter<"ingredients"> | string
    ingredient_category?: StringFilter<"ingredients"> | string
    ingredient_id?: IntFilter<"ingredients"> | number
    ingredient_image?: StringFilter<"ingredients"> | string
    ingredient_lastupdate?: StringFilter<"ingredients"> | string
    ingredient_name?: StringFilter<"ingredients"> | string
    ingredient_price?: StringFilter<"ingredients"> | string
    ingredient_price_per_unit?: StringFilter<"ingredients"> | string
    ingredient_sub_category?: StringFilter<"ingredients"> | string
    ingredient_total?: StringFilter<"ingredients"> | string
    ingredient_total_alert?: StringFilter<"ingredients"> | string
    ingredient_unit?: StringFilter<"ingredients"> | string
  }

  export type ingredientsOrderByWithRelationInput = {
    id?: SortOrder
    ingredient_category?: SortOrder
    ingredient_id?: SortOrder
    ingredient_image?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_name?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_unit?: SortOrder
  }

  export type ingredientsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ingredientsWhereInput | ingredientsWhereInput[]
    OR?: ingredientsWhereInput[]
    NOT?: ingredientsWhereInput | ingredientsWhereInput[]
    ingredient_category?: StringFilter<"ingredients"> | string
    ingredient_id?: IntFilter<"ingredients"> | number
    ingredient_image?: StringFilter<"ingredients"> | string
    ingredient_lastupdate?: StringFilter<"ingredients"> | string
    ingredient_name?: StringFilter<"ingredients"> | string
    ingredient_price?: StringFilter<"ingredients"> | string
    ingredient_price_per_unit?: StringFilter<"ingredients"> | string
    ingredient_sub_category?: StringFilter<"ingredients"> | string
    ingredient_total?: StringFilter<"ingredients"> | string
    ingredient_total_alert?: StringFilter<"ingredients"> | string
    ingredient_unit?: StringFilter<"ingredients"> | string
  }, "id">

  export type ingredientsOrderByWithAggregationInput = {
    id?: SortOrder
    ingredient_category?: SortOrder
    ingredient_id?: SortOrder
    ingredient_image?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_name?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_unit?: SortOrder
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
    id?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_category?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_id?: IntWithAggregatesFilter<"ingredients"> | number
    ingredient_image?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_lastupdate?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_name?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_price?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_price_per_unit?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_sub_category?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_total?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_total_alert?: StringWithAggregatesFilter<"ingredients"> | string
    ingredient_unit?: StringWithAggregatesFilter<"ingredients"> | string
  }

  export type lunchboxWhereInput = {
    AND?: lunchboxWhereInput | lunchboxWhereInput[]
    OR?: lunchboxWhereInput[]
    NOT?: lunchboxWhereInput | lunchboxWhereInput[]
    id?: StringFilter<"lunchbox"> | string
    lunchbox_limit?: IntFilter<"lunchbox"> | number
    lunchbox_name?: StringFilter<"lunchbox"> | string
    lunchbox_set_name?: StringFilter<"lunchbox"> | string
  }

  export type lunchboxOrderByWithRelationInput = {
    id?: SortOrder
    lunchbox_limit?: SortOrder
    lunchbox_name?: SortOrder
    lunchbox_set_name?: SortOrder
  }

  export type lunchboxWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: lunchboxWhereInput | lunchboxWhereInput[]
    OR?: lunchboxWhereInput[]
    NOT?: lunchboxWhereInput | lunchboxWhereInput[]
    lunchbox_limit?: IntFilter<"lunchbox"> | number
    lunchbox_name?: StringFilter<"lunchbox"> | string
    lunchbox_set_name?: StringFilter<"lunchbox"> | string
  }, "id">

  export type lunchboxOrderByWithAggregationInput = {
    id?: SortOrder
    lunchbox_limit?: SortOrder
    lunchbox_name?: SortOrder
    lunchbox_set_name?: SortOrder
    _count?: lunchboxCountOrderByAggregateInput
    _avg?: lunchboxAvgOrderByAggregateInput
    _max?: lunchboxMaxOrderByAggregateInput
    _min?: lunchboxMinOrderByAggregateInput
    _sum?: lunchboxSumOrderByAggregateInput
  }

  export type lunchboxScalarWhereWithAggregatesInput = {
    AND?: lunchboxScalarWhereWithAggregatesInput | lunchboxScalarWhereWithAggregatesInput[]
    OR?: lunchboxScalarWhereWithAggregatesInput[]
    NOT?: lunchboxScalarWhereWithAggregatesInput | lunchboxScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"lunchbox"> | string
    lunchbox_limit?: IntWithAggregatesFilter<"lunchbox"> | number
    lunchbox_name?: StringWithAggregatesFilter<"lunchbox"> | string
    lunchbox_set_name?: StringWithAggregatesFilter<"lunchbox"> | string
  }

  export type menuWhereInput = {
    AND?: menuWhereInput | menuWhereInput[]
    OR?: menuWhereInput[]
    NOT?: menuWhereInput | menuWhereInput[]
    id?: StringFilter<"menu"> | string
    menu_category?: StringFilter<"menu"> | string
    menu_cost?: JsonFilter<"menu">
    menu_id?: IntFilter<"menu"> | number
    menu_image?: StringFilter<"menu"> | string
    menu_ingredients?: MenuMenuIngredientsCompositeListFilter | MenuMenuIngredientsObjectEqualityInput[]
    menu_lunchbox?: MenuMenuLunchboxCompositeListFilter | MenuMenuLunchboxObjectEqualityInput[]
    menu_name?: StringFilter<"menu"> | string
    menu_subname?: StringFilter<"menu"> | string
  }

  export type menuOrderByWithRelationInput = {
    id?: SortOrder
    menu_category?: SortOrder
    menu_cost?: SortOrder
    menu_id?: SortOrder
    menu_image?: SortOrder
    menu_ingredients?: MenuMenuIngredientsOrderByCompositeAggregateInput
    menu_lunchbox?: MenuMenuLunchboxOrderByCompositeAggregateInput
    menu_name?: SortOrder
    menu_subname?: SortOrder
  }

  export type menuWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    menu_id?: number
    AND?: menuWhereInput | menuWhereInput[]
    OR?: menuWhereInput[]
    NOT?: menuWhereInput | menuWhereInput[]
    menu_category?: StringFilter<"menu"> | string
    menu_cost?: JsonFilter<"menu">
    menu_image?: StringFilter<"menu"> | string
    menu_ingredients?: MenuMenuIngredientsCompositeListFilter | MenuMenuIngredientsObjectEqualityInput[]
    menu_lunchbox?: MenuMenuLunchboxCompositeListFilter | MenuMenuLunchboxObjectEqualityInput[]
    menu_name?: StringFilter<"menu"> | string
    menu_subname?: StringFilter<"menu"> | string
  }, "id" | "menu_id">

  export type menuOrderByWithAggregationInput = {
    id?: SortOrder
    menu_category?: SortOrder
    menu_cost?: SortOrder
    menu_id?: SortOrder
    menu_image?: SortOrder
    menu_name?: SortOrder
    menu_subname?: SortOrder
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
    id?: StringWithAggregatesFilter<"menu"> | string
    menu_category?: StringWithAggregatesFilter<"menu"> | string
    menu_cost?: JsonWithAggregatesFilter<"menu">
    menu_id?: IntWithAggregatesFilter<"menu"> | number
    menu_image?: StringWithAggregatesFilter<"menu"> | string
    menu_name?: StringWithAggregatesFilter<"menu"> | string
    menu_subname?: StringWithAggregatesFilter<"menu"> | string
  }

  export type cartCreateInput = {
    id?: string
    cart_create_date: string
    cart_customer_name: string
    cart_customer_tel: string
    cart_delivery_date: string
    cart_export_time: string
    cart_id: string
    cart_last_update?: string | null
    cart_location_send: string
    cart_lunchbox?: XOR<CartCartLunchboxListCreateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListCreateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number: string
    cart_receive_time: string
    cart_shipping_cost: string
    cart_status: string
    cart_username: string
  }

  export type cartUncheckedCreateInput = {
    id?: string
    cart_create_date: string
    cart_customer_name: string
    cart_customer_tel: string
    cart_delivery_date: string
    cart_export_time: string
    cart_id: string
    cart_last_update?: string | null
    cart_location_send: string
    cart_lunchbox?: XOR<CartCartLunchboxListCreateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListCreateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number: string
    cart_receive_time: string
    cart_shipping_cost: string
    cart_status: string
    cart_username: string
  }

  export type cartUpdateInput = {
    cart_create_date?: StringFieldUpdateOperationsInput | string
    cart_customer_name?: StringFieldUpdateOperationsInput | string
    cart_customer_tel?: StringFieldUpdateOperationsInput | string
    cart_delivery_date?: StringFieldUpdateOperationsInput | string
    cart_export_time?: StringFieldUpdateOperationsInput | string
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: StringFieldUpdateOperationsInput | string
    cart_lunchbox?: XOR<CartCartLunchboxListUpdateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListUpdateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number?: StringFieldUpdateOperationsInput | string
    cart_receive_time?: StringFieldUpdateOperationsInput | string
    cart_shipping_cost?: StringFieldUpdateOperationsInput | string
    cart_status?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
  }

  export type cartUncheckedUpdateInput = {
    cart_create_date?: StringFieldUpdateOperationsInput | string
    cart_customer_name?: StringFieldUpdateOperationsInput | string
    cart_customer_tel?: StringFieldUpdateOperationsInput | string
    cart_delivery_date?: StringFieldUpdateOperationsInput | string
    cart_export_time?: StringFieldUpdateOperationsInput | string
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: StringFieldUpdateOperationsInput | string
    cart_lunchbox?: XOR<CartCartLunchboxListUpdateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListUpdateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number?: StringFieldUpdateOperationsInput | string
    cart_receive_time?: StringFieldUpdateOperationsInput | string
    cart_shipping_cost?: StringFieldUpdateOperationsInput | string
    cart_status?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
  }

  export type cartCreateManyInput = {
    id?: string
    cart_create_date: string
    cart_customer_name: string
    cart_customer_tel: string
    cart_delivery_date: string
    cart_export_time: string
    cart_id: string
    cart_last_update?: string | null
    cart_location_send: string
    cart_lunchbox?: XOR<CartCartLunchboxListCreateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListCreateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number: string
    cart_receive_time: string
    cart_shipping_cost: string
    cart_status: string
    cart_username: string
  }

  export type cartUpdateManyMutationInput = {
    cart_create_date?: StringFieldUpdateOperationsInput | string
    cart_customer_name?: StringFieldUpdateOperationsInput | string
    cart_customer_tel?: StringFieldUpdateOperationsInput | string
    cart_delivery_date?: StringFieldUpdateOperationsInput | string
    cart_export_time?: StringFieldUpdateOperationsInput | string
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: StringFieldUpdateOperationsInput | string
    cart_lunchbox?: XOR<CartCartLunchboxListUpdateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListUpdateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number?: StringFieldUpdateOperationsInput | string
    cart_receive_time?: StringFieldUpdateOperationsInput | string
    cart_shipping_cost?: StringFieldUpdateOperationsInput | string
    cart_status?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
  }

  export type cartUncheckedUpdateManyInput = {
    cart_create_date?: StringFieldUpdateOperationsInput | string
    cart_customer_name?: StringFieldUpdateOperationsInput | string
    cart_customer_tel?: StringFieldUpdateOperationsInput | string
    cart_delivery_date?: StringFieldUpdateOperationsInput | string
    cart_export_time?: StringFieldUpdateOperationsInput | string
    cart_id?: StringFieldUpdateOperationsInput | string
    cart_last_update?: NullableStringFieldUpdateOperationsInput | string | null
    cart_location_send?: StringFieldUpdateOperationsInput | string
    cart_lunchbox?: XOR<CartCartLunchboxListUpdateEnvelopeInput, CartCartLunchboxCreateInput> | CartCartLunchboxCreateInput[]
    cart_menu_items?: XOR<CartCartMenuItemsListUpdateEnvelopeInput, CartCartMenuItemsCreateInput> | CartCartMenuItemsCreateInput[]
    cart_order_number?: StringFieldUpdateOperationsInput | string
    cart_receive_time?: StringFieldUpdateOperationsInput | string
    cart_shipping_cost?: StringFieldUpdateOperationsInput | string
    cart_status?: StringFieldUpdateOperationsInput | string
    cart_username?: StringFieldUpdateOperationsInput | string
  }

  export type employeeCreateInput = {
    id?: string
    employee_firstname: string
    employee_id: string
    employee_lastname: string
    employee_pin: string
    employee_role: string
    employee_username: string
  }

  export type employeeUncheckedCreateInput = {
    id?: string
    employee_firstname: string
    employee_id: string
    employee_lastname: string
    employee_pin: string
    employee_role: string
    employee_username: string
  }

  export type employeeUpdateInput = {
    employee_firstname?: StringFieldUpdateOperationsInput | string
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_lastname?: StringFieldUpdateOperationsInput | string
    employee_pin?: StringFieldUpdateOperationsInput | string
    employee_role?: StringFieldUpdateOperationsInput | string
    employee_username?: StringFieldUpdateOperationsInput | string
  }

  export type employeeUncheckedUpdateInput = {
    employee_firstname?: StringFieldUpdateOperationsInput | string
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_lastname?: StringFieldUpdateOperationsInput | string
    employee_pin?: StringFieldUpdateOperationsInput | string
    employee_role?: StringFieldUpdateOperationsInput | string
    employee_username?: StringFieldUpdateOperationsInput | string
  }

  export type employeeCreateManyInput = {
    id?: string
    employee_firstname: string
    employee_id: string
    employee_lastname: string
    employee_pin: string
    employee_role: string
    employee_username: string
  }

  export type employeeUpdateManyMutationInput = {
    employee_firstname?: StringFieldUpdateOperationsInput | string
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_lastname?: StringFieldUpdateOperationsInput | string
    employee_pin?: StringFieldUpdateOperationsInput | string
    employee_role?: StringFieldUpdateOperationsInput | string
    employee_username?: StringFieldUpdateOperationsInput | string
  }

  export type employeeUncheckedUpdateManyInput = {
    employee_firstname?: StringFieldUpdateOperationsInput | string
    employee_id?: StringFieldUpdateOperationsInput | string
    employee_lastname?: StringFieldUpdateOperationsInput | string
    employee_pin?: StringFieldUpdateOperationsInput | string
    employee_role?: StringFieldUpdateOperationsInput | string
    employee_username?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionCreateInput = {
    id?: string
    ingredient_name: string
    transaction_date: string
    transaction_from_username: string
    transaction_id: number
    transaction_quantity: string
    transaction_total_price: string
    transaction_type: string
    transaction_units: string
  }

  export type ingredient_transactionUncheckedCreateInput = {
    id?: string
    ingredient_name: string
    transaction_date: string
    transaction_from_username: string
    transaction_id: number
    transaction_quantity: string
    transaction_total_price: string
    transaction_type: string
    transaction_units: string
  }

  export type ingredient_transactionUpdateInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_date?: StringFieldUpdateOperationsInput | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_id?: IntFieldUpdateOperationsInput | number
    transaction_quantity?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionUncheckedUpdateInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_date?: StringFieldUpdateOperationsInput | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_id?: IntFieldUpdateOperationsInput | number
    transaction_quantity?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionCreateManyInput = {
    id?: string
    ingredient_name: string
    transaction_date: string
    transaction_from_username: string
    transaction_id: number
    transaction_quantity: string
    transaction_total_price: string
    transaction_type: string
    transaction_units: string
  }

  export type ingredient_transactionUpdateManyMutationInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_date?: StringFieldUpdateOperationsInput | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_id?: IntFieldUpdateOperationsInput | number
    transaction_quantity?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredient_transactionUncheckedUpdateManyInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    transaction_date?: StringFieldUpdateOperationsInput | string
    transaction_from_username?: StringFieldUpdateOperationsInput | string
    transaction_id?: IntFieldUpdateOperationsInput | number
    transaction_quantity?: StringFieldUpdateOperationsInput | string
    transaction_total_price?: StringFieldUpdateOperationsInput | string
    transaction_type?: StringFieldUpdateOperationsInput | string
    transaction_units?: StringFieldUpdateOperationsInput | string
  }

  export type ingredientsCreateInput = {
    id?: string
    ingredient_category: string
    ingredient_id: number
    ingredient_image: string
    ingredient_lastupdate: string
    ingredient_name: string
    ingredient_price: string
    ingredient_price_per_unit: string
    ingredient_sub_category: string
    ingredient_total: string
    ingredient_total_alert: string
    ingredient_unit: string
  }

  export type ingredientsUncheckedCreateInput = {
    id?: string
    ingredient_category: string
    ingredient_id: number
    ingredient_image: string
    ingredient_lastupdate: string
    ingredient_name: string
    ingredient_price: string
    ingredient_price_per_unit: string
    ingredient_sub_category: string
    ingredient_total: string
    ingredient_total_alert: string
    ingredient_unit: string
  }

  export type ingredientsUpdateInput = {
    ingredient_category?: StringFieldUpdateOperationsInput | string
    ingredient_id?: IntFieldUpdateOperationsInput | number
    ingredient_image?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: StringFieldUpdateOperationsInput | string
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_price?: StringFieldUpdateOperationsInput | string
    ingredient_price_per_unit?: StringFieldUpdateOperationsInput | string
    ingredient_sub_category?: StringFieldUpdateOperationsInput | string
    ingredient_total?: StringFieldUpdateOperationsInput | string
    ingredient_total_alert?: StringFieldUpdateOperationsInput | string
    ingredient_unit?: StringFieldUpdateOperationsInput | string
  }

  export type ingredientsUncheckedUpdateInput = {
    ingredient_category?: StringFieldUpdateOperationsInput | string
    ingredient_id?: IntFieldUpdateOperationsInput | number
    ingredient_image?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: StringFieldUpdateOperationsInput | string
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_price?: StringFieldUpdateOperationsInput | string
    ingredient_price_per_unit?: StringFieldUpdateOperationsInput | string
    ingredient_sub_category?: StringFieldUpdateOperationsInput | string
    ingredient_total?: StringFieldUpdateOperationsInput | string
    ingredient_total_alert?: StringFieldUpdateOperationsInput | string
    ingredient_unit?: StringFieldUpdateOperationsInput | string
  }

  export type ingredientsCreateManyInput = {
    id?: string
    ingredient_category: string
    ingredient_id: number
    ingredient_image: string
    ingredient_lastupdate: string
    ingredient_name: string
    ingredient_price: string
    ingredient_price_per_unit: string
    ingredient_sub_category: string
    ingredient_total: string
    ingredient_total_alert: string
    ingredient_unit: string
  }

  export type ingredientsUpdateManyMutationInput = {
    ingredient_category?: StringFieldUpdateOperationsInput | string
    ingredient_id?: IntFieldUpdateOperationsInput | number
    ingredient_image?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: StringFieldUpdateOperationsInput | string
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_price?: StringFieldUpdateOperationsInput | string
    ingredient_price_per_unit?: StringFieldUpdateOperationsInput | string
    ingredient_sub_category?: StringFieldUpdateOperationsInput | string
    ingredient_total?: StringFieldUpdateOperationsInput | string
    ingredient_total_alert?: StringFieldUpdateOperationsInput | string
    ingredient_unit?: StringFieldUpdateOperationsInput | string
  }

  export type ingredientsUncheckedUpdateManyInput = {
    ingredient_category?: StringFieldUpdateOperationsInput | string
    ingredient_id?: IntFieldUpdateOperationsInput | number
    ingredient_image?: StringFieldUpdateOperationsInput | string
    ingredient_lastupdate?: StringFieldUpdateOperationsInput | string
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_price?: StringFieldUpdateOperationsInput | string
    ingredient_price_per_unit?: StringFieldUpdateOperationsInput | string
    ingredient_sub_category?: StringFieldUpdateOperationsInput | string
    ingredient_total?: StringFieldUpdateOperationsInput | string
    ingredient_total_alert?: StringFieldUpdateOperationsInput | string
    ingredient_unit?: StringFieldUpdateOperationsInput | string
  }

  export type lunchboxCreateInput = {
    id?: string
    lunchbox_limit: number
    lunchbox_name: string
    lunchbox_set_name: string
  }

  export type lunchboxUncheckedCreateInput = {
    id?: string
    lunchbox_limit: number
    lunchbox_name: string
    lunchbox_set_name: string
  }

  export type lunchboxUpdateInput = {
    lunchbox_limit?: IntFieldUpdateOperationsInput | number
    lunchbox_name?: StringFieldUpdateOperationsInput | string
    lunchbox_set_name?: StringFieldUpdateOperationsInput | string
  }

  export type lunchboxUncheckedUpdateInput = {
    lunchbox_limit?: IntFieldUpdateOperationsInput | number
    lunchbox_name?: StringFieldUpdateOperationsInput | string
    lunchbox_set_name?: StringFieldUpdateOperationsInput | string
  }

  export type lunchboxCreateManyInput = {
    id?: string
    lunchbox_limit: number
    lunchbox_name: string
    lunchbox_set_name: string
  }

  export type lunchboxUpdateManyMutationInput = {
    lunchbox_limit?: IntFieldUpdateOperationsInput | number
    lunchbox_name?: StringFieldUpdateOperationsInput | string
    lunchbox_set_name?: StringFieldUpdateOperationsInput | string
  }

  export type lunchboxUncheckedUpdateManyInput = {
    lunchbox_limit?: IntFieldUpdateOperationsInput | number
    lunchbox_name?: StringFieldUpdateOperationsInput | string
    lunchbox_set_name?: StringFieldUpdateOperationsInput | string
  }

  export type menuCreateInput = {
    id?: string
    menu_category: string
    menu_cost: InputJsonValue
    menu_id: number
    menu_image: string
    menu_ingredients?: XOR<MenuMenuIngredientsListCreateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListCreateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name: string
    menu_subname: string
  }

  export type menuUncheckedCreateInput = {
    id?: string
    menu_category: string
    menu_cost: InputJsonValue
    menu_id: number
    menu_image: string
    menu_ingredients?: XOR<MenuMenuIngredientsListCreateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListCreateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name: string
    menu_subname: string
  }

  export type menuUpdateInput = {
    menu_category?: StringFieldUpdateOperationsInput | string
    menu_cost?: InputJsonValue | InputJsonValue
    menu_id?: IntFieldUpdateOperationsInput | number
    menu_image?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: XOR<MenuMenuIngredientsListUpdateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListUpdateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_subname?: StringFieldUpdateOperationsInput | string
  }

  export type menuUncheckedUpdateInput = {
    menu_category?: StringFieldUpdateOperationsInput | string
    menu_cost?: InputJsonValue | InputJsonValue
    menu_id?: IntFieldUpdateOperationsInput | number
    menu_image?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: XOR<MenuMenuIngredientsListUpdateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListUpdateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_subname?: StringFieldUpdateOperationsInput | string
  }

  export type menuCreateManyInput = {
    id?: string
    menu_category: string
    menu_cost: InputJsonValue
    menu_id: number
    menu_image: string
    menu_ingredients?: XOR<MenuMenuIngredientsListCreateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListCreateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name: string
    menu_subname: string
  }

  export type menuUpdateManyMutationInput = {
    menu_category?: StringFieldUpdateOperationsInput | string
    menu_cost?: InputJsonValue | InputJsonValue
    menu_id?: IntFieldUpdateOperationsInput | number
    menu_image?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: XOR<MenuMenuIngredientsListUpdateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListUpdateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_subname?: StringFieldUpdateOperationsInput | string
  }

  export type menuUncheckedUpdateManyInput = {
    menu_category?: StringFieldUpdateOperationsInput | string
    menu_cost?: InputJsonValue | InputJsonValue
    menu_id?: IntFieldUpdateOperationsInput | number
    menu_image?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: XOR<MenuMenuIngredientsListUpdateEnvelopeInput, MenuMenuIngredientsCreateInput> | MenuMenuIngredientsCreateInput[]
    menu_lunchbox?: XOR<MenuMenuLunchboxListUpdateEnvelopeInput, MenuMenuLunchboxCreateInput> | MenuMenuLunchboxCreateInput[]
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_subname?: StringFieldUpdateOperationsInput | string
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
    isSet?: boolean
  }

  export type CartCartLunchboxCompositeListFilter = {
    equals?: CartCartLunchboxObjectEqualityInput[]
    every?: CartCartLunchboxWhereInput
    some?: CartCartLunchboxWhereInput
    none?: CartCartLunchboxWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type CartCartLunchboxObjectEqualityInput = {
    lunchbox_limit: InputJsonValue
    lunchbox_menu?: CartCartLunchboxLunchboxMenuObjectEqualityInput[]
    lunchbox_name: string
    lunchbox_set_name: string
    lunchbox_total: InputJsonValue
    lunchbox_total_cost: number
  }

  export type CartCartMenuItemsCompositeListFilter = {
    equals?: CartCartMenuItemsObjectEqualityInput[]
    every?: CartCartMenuItemsWhereInput
    some?: CartCartMenuItemsWhereInput
    none?: CartCartMenuItemsWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type CartCartMenuItemsObjectEqualityInput = {
    menu_description?: string | null
    menu_ingredients?: CartCartMenuItemsMenuIngredientsObjectEqualityInput[]
    menu_name: string
    menu_notes?: CartCartMenuItemsMenuNotesObjectEqualityInput[]
    menu_order_id?: number | null
    menu_total: number
  }

  export type CartCartLunchboxOrderByCompositeAggregateInput = {
    _count?: SortOrder
  }

  export type CartCartMenuItemsOrderByCompositeAggregateInput = {
    _count?: SortOrder
  }

  export type cartCountOrderByAggregateInput = {
    id?: SortOrder
    cart_create_date?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_id?: SortOrder
    cart_last_update?: SortOrder
    cart_location_send?: SortOrder
    cart_order_number?: SortOrder
    cart_receive_time?: SortOrder
    cart_shipping_cost?: SortOrder
    cart_status?: SortOrder
    cart_username?: SortOrder
  }

  export type cartMaxOrderByAggregateInput = {
    id?: SortOrder
    cart_create_date?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_id?: SortOrder
    cart_last_update?: SortOrder
    cart_location_send?: SortOrder
    cart_order_number?: SortOrder
    cart_receive_time?: SortOrder
    cart_shipping_cost?: SortOrder
    cart_status?: SortOrder
    cart_username?: SortOrder
  }

  export type cartMinOrderByAggregateInput = {
    id?: SortOrder
    cart_create_date?: SortOrder
    cart_customer_name?: SortOrder
    cart_customer_tel?: SortOrder
    cart_delivery_date?: SortOrder
    cart_export_time?: SortOrder
    cart_id?: SortOrder
    cart_last_update?: SortOrder
    cart_location_send?: SortOrder
    cart_order_number?: SortOrder
    cart_receive_time?: SortOrder
    cart_shipping_cost?: SortOrder
    cart_status?: SortOrder
    cart_username?: SortOrder
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
    isSet?: boolean
  }

  export type employeeCountOrderByAggregateInput = {
    id?: SortOrder
    employee_firstname?: SortOrder
    employee_id?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
    employee_username?: SortOrder
  }

  export type employeeMaxOrderByAggregateInput = {
    id?: SortOrder
    employee_firstname?: SortOrder
    employee_id?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
    employee_username?: SortOrder
  }

  export type employeeMinOrderByAggregateInput = {
    id?: SortOrder
    employee_firstname?: SortOrder
    employee_id?: SortOrder
    employee_lastname?: SortOrder
    employee_pin?: SortOrder
    employee_role?: SortOrder
    employee_username?: SortOrder
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

  export type ingredient_transactionCountOrderByAggregateInput = {
    id?: SortOrder
    ingredient_name?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_id?: SortOrder
    transaction_quantity?: SortOrder
    transaction_total_price?: SortOrder
    transaction_type?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionAvgOrderByAggregateInput = {
    transaction_id?: SortOrder
  }

  export type ingredient_transactionMaxOrderByAggregateInput = {
    id?: SortOrder
    ingredient_name?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_id?: SortOrder
    transaction_quantity?: SortOrder
    transaction_total_price?: SortOrder
    transaction_type?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionMinOrderByAggregateInput = {
    id?: SortOrder
    ingredient_name?: SortOrder
    transaction_date?: SortOrder
    transaction_from_username?: SortOrder
    transaction_id?: SortOrder
    transaction_quantity?: SortOrder
    transaction_total_price?: SortOrder
    transaction_type?: SortOrder
    transaction_units?: SortOrder
  }

  export type ingredient_transactionSumOrderByAggregateInput = {
    transaction_id?: SortOrder
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

  export type ingredientsCountOrderByAggregateInput = {
    id?: SortOrder
    ingredient_category?: SortOrder
    ingredient_id?: SortOrder
    ingredient_image?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_name?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_unit?: SortOrder
  }

  export type ingredientsAvgOrderByAggregateInput = {
    ingredient_id?: SortOrder
  }

  export type ingredientsMaxOrderByAggregateInput = {
    id?: SortOrder
    ingredient_category?: SortOrder
    ingredient_id?: SortOrder
    ingredient_image?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_name?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_unit?: SortOrder
  }

  export type ingredientsMinOrderByAggregateInput = {
    id?: SortOrder
    ingredient_category?: SortOrder
    ingredient_id?: SortOrder
    ingredient_image?: SortOrder
    ingredient_lastupdate?: SortOrder
    ingredient_name?: SortOrder
    ingredient_price?: SortOrder
    ingredient_price_per_unit?: SortOrder
    ingredient_sub_category?: SortOrder
    ingredient_total?: SortOrder
    ingredient_total_alert?: SortOrder
    ingredient_unit?: SortOrder
  }

  export type ingredientsSumOrderByAggregateInput = {
    ingredient_id?: SortOrder
  }

  export type lunchboxCountOrderByAggregateInput = {
    id?: SortOrder
    lunchbox_limit?: SortOrder
    lunchbox_name?: SortOrder
    lunchbox_set_name?: SortOrder
  }

  export type lunchboxAvgOrderByAggregateInput = {
    lunchbox_limit?: SortOrder
  }

  export type lunchboxMaxOrderByAggregateInput = {
    id?: SortOrder
    lunchbox_limit?: SortOrder
    lunchbox_name?: SortOrder
    lunchbox_set_name?: SortOrder
  }

  export type lunchboxMinOrderByAggregateInput = {
    id?: SortOrder
    lunchbox_limit?: SortOrder
    lunchbox_name?: SortOrder
    lunchbox_set_name?: SortOrder
  }

  export type lunchboxSumOrderByAggregateInput = {
    lunchbox_limit?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type MenuMenuIngredientsCompositeListFilter = {
    equals?: MenuMenuIngredientsObjectEqualityInput[]
    every?: MenuMenuIngredientsWhereInput
    some?: MenuMenuIngredientsWhereInput
    none?: MenuMenuIngredientsWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type MenuMenuIngredientsObjectEqualityInput = {
    ingredient_name: string
    useItem: InputJsonValue
  }

  export type MenuMenuLunchboxCompositeListFilter = {
    equals?: MenuMenuLunchboxObjectEqualityInput[]
    every?: MenuMenuLunchboxWhereInput
    some?: MenuMenuLunchboxWhereInput
    none?: MenuMenuLunchboxWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type MenuMenuLunchboxObjectEqualityInput = {
    lunchbox_name: string
    lunchbox_set_name: string
  }

  export type MenuMenuIngredientsOrderByCompositeAggregateInput = {
    _count?: SortOrder
  }

  export type MenuMenuLunchboxOrderByCompositeAggregateInput = {
    _count?: SortOrder
  }

  export type menuCountOrderByAggregateInput = {
    id?: SortOrder
    menu_category?: SortOrder
    menu_cost?: SortOrder
    menu_id?: SortOrder
    menu_image?: SortOrder
    menu_name?: SortOrder
    menu_subname?: SortOrder
  }

  export type menuAvgOrderByAggregateInput = {
    menu_id?: SortOrder
  }

  export type menuMaxOrderByAggregateInput = {
    id?: SortOrder
    menu_category?: SortOrder
    menu_id?: SortOrder
    menu_image?: SortOrder
    menu_name?: SortOrder
    menu_subname?: SortOrder
  }

  export type menuMinOrderByAggregateInput = {
    id?: SortOrder
    menu_category?: SortOrder
    menu_id?: SortOrder
    menu_image?: SortOrder
    menu_name?: SortOrder
    menu_subname?: SortOrder
  }

  export type menuSumOrderByAggregateInput = {
    menu_id?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type CartCartLunchboxListCreateEnvelopeInput = {
    set?: CartCartLunchboxCreateInput | CartCartLunchboxCreateInput[]
  }

  export type CartCartLunchboxCreateInput = {
    lunchbox_limit: InputJsonValue
    lunchbox_menu?: CartCartLunchboxLunchboxMenuCreateInput | CartCartLunchboxLunchboxMenuCreateInput[]
    lunchbox_name: string
    lunchbox_set_name: string
    lunchbox_total: InputJsonValue
    lunchbox_total_cost: number
  }

  export type CartCartMenuItemsListCreateEnvelopeInput = {
    set?: CartCartMenuItemsCreateInput | CartCartMenuItemsCreateInput[]
  }

  export type CartCartMenuItemsCreateInput = {
    menu_description?: string | null
    menu_ingredients?: CartCartMenuItemsMenuIngredientsCreateInput | CartCartMenuItemsMenuIngredientsCreateInput[]
    menu_name: string
    menu_notes?: CartCartMenuItemsMenuNotesCreateInput | CartCartMenuItemsMenuNotesCreateInput[]
    menu_order_id?: number | null
    menu_total: number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type CartCartLunchboxListUpdateEnvelopeInput = {
    set?: CartCartLunchboxCreateInput | CartCartLunchboxCreateInput[]
    push?: CartCartLunchboxCreateInput | CartCartLunchboxCreateInput[]
    updateMany?: CartCartLunchboxUpdateManyInput
    deleteMany?: CartCartLunchboxDeleteManyInput
  }

  export type CartCartMenuItemsListUpdateEnvelopeInput = {
    set?: CartCartMenuItemsCreateInput | CartCartMenuItemsCreateInput[]
    push?: CartCartMenuItemsCreateInput | CartCartMenuItemsCreateInput[]
    updateMany?: CartCartMenuItemsUpdateManyInput
    deleteMany?: CartCartMenuItemsDeleteManyInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type MenuMenuIngredientsListCreateEnvelopeInput = {
    set?: MenuMenuIngredientsCreateInput | MenuMenuIngredientsCreateInput[]
  }

  export type MenuMenuIngredientsCreateInput = {
    ingredient_name: string
    useItem: InputJsonValue
  }

  export type MenuMenuLunchboxListCreateEnvelopeInput = {
    set?: MenuMenuLunchboxCreateInput | MenuMenuLunchboxCreateInput[]
  }

  export type MenuMenuLunchboxCreateInput = {
    lunchbox_name: string
    lunchbox_set_name: string
  }

  export type MenuMenuIngredientsListUpdateEnvelopeInput = {
    set?: MenuMenuIngredientsCreateInput | MenuMenuIngredientsCreateInput[]
    push?: MenuMenuIngredientsCreateInput | MenuMenuIngredientsCreateInput[]
    updateMany?: MenuMenuIngredientsUpdateManyInput
    deleteMany?: MenuMenuIngredientsDeleteManyInput
  }

  export type MenuMenuLunchboxListUpdateEnvelopeInput = {
    set?: MenuMenuLunchboxCreateInput | MenuMenuLunchboxCreateInput[]
    push?: MenuMenuLunchboxCreateInput | MenuMenuLunchboxCreateInput[]
    updateMany?: MenuMenuLunchboxUpdateManyInput
    deleteMany?: MenuMenuLunchboxDeleteManyInput
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
    isSet?: boolean
  }

  export type CartCartLunchboxWhereInput = {
    AND?: CartCartLunchboxWhereInput | CartCartLunchboxWhereInput[]
    OR?: CartCartLunchboxWhereInput[]
    NOT?: CartCartLunchboxWhereInput | CartCartLunchboxWhereInput[]
    lunchbox_limit?: JsonFilter<"CartCartLunchbox">
    lunchbox_menu?: CartCartLunchboxLunchboxMenuCompositeListFilter | CartCartLunchboxLunchboxMenuObjectEqualityInput[]
    lunchbox_name?: StringFilter<"CartCartLunchbox"> | string
    lunchbox_set_name?: StringFilter<"CartCartLunchbox"> | string
    lunchbox_total?: JsonFilter<"CartCartLunchbox">
    lunchbox_total_cost?: IntFilter<"CartCartLunchbox"> | number
  }

  export type CartCartLunchboxLunchboxMenuObjectEqualityInput = {
    menu_category: string
    menu_cost?: bigint | number | null
    menu_description: string
    menu_ingredients?: CartCartLunchboxLunchboxMenuMenuIngredientsObjectEqualityInput[]
    menu_name: string
    menu_order_id: InputJsonValue
    menu_subname: string
    menu_total: InputJsonValue
  }

  export type CartCartMenuItemsWhereInput = {
    AND?: CartCartMenuItemsWhereInput | CartCartMenuItemsWhereInput[]
    OR?: CartCartMenuItemsWhereInput[]
    NOT?: CartCartMenuItemsWhereInput | CartCartMenuItemsWhereInput[]
    menu_description?: StringNullableFilter<"CartCartMenuItems"> | string | null
    menu_ingredients?: CartCartMenuItemsMenuIngredientsCompositeListFilter | CartCartMenuItemsMenuIngredientsObjectEqualityInput[]
    menu_name?: StringFilter<"CartCartMenuItems"> | string
    menu_notes?: CartCartMenuItemsMenuNotesCompositeListFilter | CartCartMenuItemsMenuNotesObjectEqualityInput[]
    menu_order_id?: IntNullableFilter<"CartCartMenuItems"> | number | null
    menu_total?: IntFilter<"CartCartMenuItems"> | number
  }

  export type CartCartMenuItemsMenuIngredientsObjectEqualityInput = {
    ingredient_name: string
    ingredient_status?: boolean | null
    useItem: number
  }

  export type CartCartMenuItemsMenuNotesObjectEqualityInput = {
    note: string
    qty: number
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
    isSet?: boolean
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
    isSet?: boolean
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

  export type MenuMenuIngredientsWhereInput = {
    AND?: MenuMenuIngredientsWhereInput | MenuMenuIngredientsWhereInput[]
    OR?: MenuMenuIngredientsWhereInput[]
    NOT?: MenuMenuIngredientsWhereInput | MenuMenuIngredientsWhereInput[]
    ingredient_name?: StringFilter<"MenuMenuIngredients"> | string
    useItem?: JsonFilter<"MenuMenuIngredients">
  }

  export type MenuMenuLunchboxWhereInput = {
    AND?: MenuMenuLunchboxWhereInput | MenuMenuLunchboxWhereInput[]
    OR?: MenuMenuLunchboxWhereInput[]
    NOT?: MenuMenuLunchboxWhereInput | MenuMenuLunchboxWhereInput[]
    lunchbox_name?: StringFilter<"MenuMenuLunchbox"> | string
    lunchbox_set_name?: StringFilter<"MenuMenuLunchbox"> | string
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type CartCartLunchboxLunchboxMenuCreateInput = {
    menu_category: string
    menu_cost?: bigint | number | null
    menu_description: string
    menu_ingredients?: CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput | CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput[]
    menu_name: string
    menu_order_id: InputJsonValue
    menu_subname: string
    menu_total: InputJsonValue
  }

  export type CartCartMenuItemsMenuIngredientsCreateInput = {
    ingredient_name: string
    ingredient_status?: boolean | null
    useItem: number
  }

  export type CartCartMenuItemsMenuNotesCreateInput = {
    note: string
    qty: number
  }

  export type CartCartLunchboxUpdateManyInput = {
    where: CartCartLunchboxWhereInput
    data: CartCartLunchboxUpdateInput
  }

  export type CartCartLunchboxDeleteManyInput = {
    where: CartCartLunchboxWhereInput
  }

  export type CartCartMenuItemsUpdateManyInput = {
    where: CartCartMenuItemsWhereInput
    data: CartCartMenuItemsUpdateInput
  }

  export type CartCartMenuItemsDeleteManyInput = {
    where: CartCartMenuItemsWhereInput
  }

  export type MenuMenuIngredientsUpdateManyInput = {
    where: MenuMenuIngredientsWhereInput
    data: MenuMenuIngredientsUpdateInput
  }

  export type MenuMenuIngredientsDeleteManyInput = {
    where: MenuMenuIngredientsWhereInput
  }

  export type MenuMenuLunchboxUpdateManyInput = {
    where: MenuMenuLunchboxWhereInput
    data: MenuMenuLunchboxUpdateInput
  }

  export type MenuMenuLunchboxDeleteManyInput = {
    where: MenuMenuLunchboxWhereInput
  }

  export type CartCartLunchboxLunchboxMenuCompositeListFilter = {
    equals?: CartCartLunchboxLunchboxMenuObjectEqualityInput[]
    every?: CartCartLunchboxLunchboxMenuWhereInput
    some?: CartCartLunchboxLunchboxMenuWhereInput
    none?: CartCartLunchboxLunchboxMenuWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsObjectEqualityInput = {
    ingredient_name: string
    useItem: InputJsonValue
  }

  export type CartCartMenuItemsMenuIngredientsCompositeListFilter = {
    equals?: CartCartMenuItemsMenuIngredientsObjectEqualityInput[]
    every?: CartCartMenuItemsMenuIngredientsWhereInput
    some?: CartCartMenuItemsMenuIngredientsWhereInput
    none?: CartCartMenuItemsMenuIngredientsWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type CartCartMenuItemsMenuNotesCompositeListFilter = {
    equals?: CartCartMenuItemsMenuNotesObjectEqualityInput[]
    every?: CartCartMenuItemsMenuNotesWhereInput
    some?: CartCartMenuItemsMenuNotesWhereInput
    none?: CartCartMenuItemsMenuNotesWhereInput
    isEmpty?: boolean
    isSet?: boolean
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
    isSet?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput = {
    ingredient_name: string
    useItem: InputJsonValue
  }

  export type CartCartLunchboxUpdateInput = {
    lunchbox_limit?: InputJsonValue | InputJsonValue
    lunchbox_menu?: XOR<CartCartLunchboxLunchboxMenuListUpdateEnvelopeInput, CartCartLunchboxLunchboxMenuCreateInput> | CartCartLunchboxLunchboxMenuCreateInput[]
    lunchbox_name?: StringFieldUpdateOperationsInput | string
    lunchbox_set_name?: StringFieldUpdateOperationsInput | string
    lunchbox_total?: InputJsonValue | InputJsonValue
    lunchbox_total_cost?: IntFieldUpdateOperationsInput | number
  }

  export type CartCartMenuItemsUpdateInput = {
    menu_description?: NullableStringFieldUpdateOperationsInput | string | null
    menu_ingredients?: XOR<CartCartMenuItemsMenuIngredientsListUpdateEnvelopeInput, CartCartMenuItemsMenuIngredientsCreateInput> | CartCartMenuItemsMenuIngredientsCreateInput[]
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_notes?: XOR<CartCartMenuItemsMenuNotesListUpdateEnvelopeInput, CartCartMenuItemsMenuNotesCreateInput> | CartCartMenuItemsMenuNotesCreateInput[]
    menu_order_id?: NullableIntFieldUpdateOperationsInput | number | null
    menu_total?: IntFieldUpdateOperationsInput | number
  }

  export type MenuMenuIngredientsUpdateInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    useItem?: InputJsonValue | InputJsonValue
  }

  export type MenuMenuLunchboxUpdateInput = {
    lunchbox_name?: StringFieldUpdateOperationsInput | string
    lunchbox_set_name?: StringFieldUpdateOperationsInput | string
  }

  export type CartCartLunchboxLunchboxMenuWhereInput = {
    AND?: CartCartLunchboxLunchboxMenuWhereInput | CartCartLunchboxLunchboxMenuWhereInput[]
    OR?: CartCartLunchboxLunchboxMenuWhereInput[]
    NOT?: CartCartLunchboxLunchboxMenuWhereInput | CartCartLunchboxLunchboxMenuWhereInput[]
    menu_category?: StringFilter<"CartCartLunchboxLunchboxMenu"> | string
    menu_cost?: BigIntNullableFilter<"CartCartLunchboxLunchboxMenu"> | bigint | number | null
    menu_description?: StringFilter<"CartCartLunchboxLunchboxMenu"> | string
    menu_ingredients?: CartCartLunchboxLunchboxMenuMenuIngredientsCompositeListFilter | CartCartLunchboxLunchboxMenuMenuIngredientsObjectEqualityInput[]
    menu_name?: StringFilter<"CartCartLunchboxLunchboxMenu"> | string
    menu_order_id?: JsonFilter<"CartCartLunchboxLunchboxMenu">
    menu_subname?: StringFilter<"CartCartLunchboxLunchboxMenu"> | string
    menu_total?: JsonFilter<"CartCartLunchboxLunchboxMenu">
  }

  export type CartCartMenuItemsMenuIngredientsWhereInput = {
    AND?: CartCartMenuItemsMenuIngredientsWhereInput | CartCartMenuItemsMenuIngredientsWhereInput[]
    OR?: CartCartMenuItemsMenuIngredientsWhereInput[]
    NOT?: CartCartMenuItemsMenuIngredientsWhereInput | CartCartMenuItemsMenuIngredientsWhereInput[]
    ingredient_name?: StringFilter<"CartCartMenuItemsMenuIngredients"> | string
    ingredient_status?: BoolNullableFilter<"CartCartMenuItemsMenuIngredients"> | boolean | null
    useItem?: IntFilter<"CartCartMenuItemsMenuIngredients"> | number
  }

  export type CartCartMenuItemsMenuNotesWhereInput = {
    AND?: CartCartMenuItemsMenuNotesWhereInput | CartCartMenuItemsMenuNotesWhereInput[]
    OR?: CartCartMenuItemsMenuNotesWhereInput[]
    NOT?: CartCartMenuItemsMenuNotesWhereInput | CartCartMenuItemsMenuNotesWhereInput[]
    note?: StringFilter<"CartCartMenuItemsMenuNotes"> | string
    qty?: IntFilter<"CartCartMenuItemsMenuNotes"> | number
  }

  export type CartCartLunchboxLunchboxMenuListUpdateEnvelopeInput = {
    set?: CartCartLunchboxLunchboxMenuCreateInput | CartCartLunchboxLunchboxMenuCreateInput[]
    push?: CartCartLunchboxLunchboxMenuCreateInput | CartCartLunchboxLunchboxMenuCreateInput[]
    updateMany?: CartCartLunchboxLunchboxMenuUpdateManyInput
    deleteMany?: CartCartLunchboxLunchboxMenuDeleteManyInput
  }

  export type CartCartMenuItemsMenuIngredientsListUpdateEnvelopeInput = {
    set?: CartCartMenuItemsMenuIngredientsCreateInput | CartCartMenuItemsMenuIngredientsCreateInput[]
    push?: CartCartMenuItemsMenuIngredientsCreateInput | CartCartMenuItemsMenuIngredientsCreateInput[]
    updateMany?: CartCartMenuItemsMenuIngredientsUpdateManyInput
    deleteMany?: CartCartMenuItemsMenuIngredientsDeleteManyInput
  }

  export type CartCartMenuItemsMenuNotesListUpdateEnvelopeInput = {
    set?: CartCartMenuItemsMenuNotesCreateInput | CartCartMenuItemsMenuNotesCreateInput[]
    push?: CartCartMenuItemsMenuNotesCreateInput | CartCartMenuItemsMenuNotesCreateInput[]
    updateMany?: CartCartMenuItemsMenuNotesUpdateManyInput
    deleteMany?: CartCartMenuItemsMenuNotesDeleteManyInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
    unset?: boolean
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
    isSet?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsCompositeListFilter = {
    equals?: CartCartLunchboxLunchboxMenuMenuIngredientsObjectEqualityInput[]
    every?: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput
    some?: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput
    none?: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput
    isEmpty?: boolean
    isSet?: boolean
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
    isSet?: boolean
  }

  export type CartCartLunchboxLunchboxMenuUpdateManyInput = {
    where: CartCartLunchboxLunchboxMenuWhereInput
    data: CartCartLunchboxLunchboxMenuUpdateInput
  }

  export type CartCartLunchboxLunchboxMenuDeleteManyInput = {
    where: CartCartLunchboxLunchboxMenuWhereInput
  }

  export type CartCartMenuItemsMenuIngredientsUpdateManyInput = {
    where: CartCartMenuItemsMenuIngredientsWhereInput
    data: CartCartMenuItemsMenuIngredientsUpdateInput
  }

  export type CartCartMenuItemsMenuIngredientsDeleteManyInput = {
    where: CartCartMenuItemsMenuIngredientsWhereInput
  }

  export type CartCartMenuItemsMenuNotesUpdateManyInput = {
    where: CartCartMenuItemsMenuNotesWhereInput
    data: CartCartMenuItemsMenuNotesUpdateInput
  }

  export type CartCartMenuItemsMenuNotesDeleteManyInput = {
    where: CartCartMenuItemsMenuNotesWhereInput
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
    isSet?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput = {
    AND?: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput | CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput[]
    OR?: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput[]
    NOT?: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput | CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput[]
    ingredient_name?: StringFilter<"CartCartLunchboxLunchboxMenuMenuIngredients"> | string
    useItem?: JsonFilter<"CartCartLunchboxLunchboxMenuMenuIngredients">
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
    isSet?: boolean
  }

  export type CartCartLunchboxLunchboxMenuUpdateInput = {
    menu_category?: StringFieldUpdateOperationsInput | string
    menu_cost?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    menu_description?: StringFieldUpdateOperationsInput | string
    menu_ingredients?: XOR<CartCartLunchboxLunchboxMenuMenuIngredientsListUpdateEnvelopeInput, CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput> | CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput[]
    menu_name?: StringFieldUpdateOperationsInput | string
    menu_order_id?: InputJsonValue | InputJsonValue
    menu_subname?: StringFieldUpdateOperationsInput | string
    menu_total?: InputJsonValue | InputJsonValue
  }

  export type CartCartMenuItemsMenuIngredientsUpdateInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    ingredient_status?: NullableBoolFieldUpdateOperationsInput | boolean | null
    useItem?: IntFieldUpdateOperationsInput | number
  }

  export type CartCartMenuItemsMenuNotesUpdateInput = {
    note?: StringFieldUpdateOperationsInput | string
    qty?: IntFieldUpdateOperationsInput | number
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
    unset?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsListUpdateEnvelopeInput = {
    set?: CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput | CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput[]
    push?: CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput | CartCartLunchboxLunchboxMenuMenuIngredientsCreateInput[]
    updateMany?: CartCartLunchboxLunchboxMenuMenuIngredientsUpdateManyInput
    deleteMany?: CartCartLunchboxLunchboxMenuMenuIngredientsDeleteManyInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
    unset?: boolean
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsUpdateManyInput = {
    where: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput
    data: CartCartLunchboxLunchboxMenuMenuIngredientsUpdateInput
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsDeleteManyInput = {
    where: CartCartLunchboxLunchboxMenuMenuIngredientsWhereInput
  }

  export type CartCartLunchboxLunchboxMenuMenuIngredientsUpdateInput = {
    ingredient_name?: StringFieldUpdateOperationsInput | string
    useItem?: InputJsonValue | InputJsonValue
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