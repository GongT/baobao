function noop() {}

/** @internal */
export const captureStackTrace = Error.captureStackTrace ?? noop;
