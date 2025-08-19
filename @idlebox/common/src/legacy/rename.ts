import { convertCaughtError } from '../error/convert-unknown.js';
import { functionToDisposable } from '../lifecycle/dispose/bridges/function.js';
import { EnhancedAsyncDisposable } from '../lifecycle/dispose/async-disposable.js';
import { EnhancedDisposable } from '../lifecycle/dispose/sync-disposable.js';

/** @deprecated use functionToDisposable */
export const toDisposable = functionToDisposable;

/** @deprecated use EnhancedAsyncDisposable */
export const AsyncDisposable = EnhancedAsyncDisposable;
/** @deprecated use EnhancedDisposable */
export const Disposable = EnhancedDisposable;

/** @deprecated use convertCaughtError */
export const convertCatchedError = convertCaughtError;
