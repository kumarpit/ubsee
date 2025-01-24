// most of this file is taken from
// here https://imhoff.blog/posts/using-results-in-typescript + our additions

export type Result<T, E = Error> =
  | {ok: true; value: T}
  | {ok: false; error: E};

export interface Matchers<T, E extends Error, R1, R2> {
    ok(value: T): R1;
    err(error: E): R2;
}

export const match = <T, E extends Error, R1, R2>(matchers: Matchers<T, E, R1, R2>) =>
	(result: Result<T, E>) => result.ok === true ? matchers.ok(result.value) : matchers.err(result.error);

export function ok<T, E = Error>(val: T): Result<T, E> {
	return {ok: true, value: val};
}

export function _err<T, E = Error>(err: E): Result<T, E> {
	return {ok: false, error: err};
}
