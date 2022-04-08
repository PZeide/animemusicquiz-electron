// https://github.com/sindresorhus/type-fest/issues/213

type Ensure<X, Y> = X extends Y ? X : never;
type SafeKey<T> = T extends string | number ? `${T}` : never;
type SafeValue<O, K> = K extends keyof O ? O[K] : never;

declare type Paths<O, P = ""> = O extends object
  ? {
      [K in keyof O]:
        | (P extends "" ? K : `${SafeKey<P>}.${SafeKey<K>}`)
        | Paths<O[K], P extends "" ? K : `${SafeKey<P>}.${SafeKey<K>}`>;
    }[keyof O]
  : never;

declare type Get<O, P extends Paths<O>> = P extends `${infer X}.${infer XS}`
  ? Get<SafeValue<O, X>, Ensure<XS, Paths<SafeValue<O, X>>>>
  : SafeValue<O, P>;
