// from https://stackoverflow.com/questions/46370222/why-does-a-b-allow-a-combination-of-both-and-how-can-i-prevent-it
// type AllKeys<T> = T extends unknown ? keyof T : never;
// type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
// type _ExclusifyUnion<T, K extends PropertyKey> =
//     T extends unknown ? Id<T & Partial<Record<Exclude<K, keyof T>, never>>> : never;
// export type ExclusifyUnion<T> = _ExclusifyUnion<T, AllKeys<T>>;

// from https://www.reddit.com/r/typescript/comments/xdqrm0/best_way_to_specify_an_xor_type/
type Without<T, U> = {[P in Exclude<keyof T, keyof U>]?: never};
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
