/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * @build-script/autoindex - Automatic TypeScript index file generator
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/
/// <reference types="debug" />
/// <reference path="../config/global.d.ts" />

// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore

/* array/diff.ts */
	// Identifiers (2)
	export type { IArrayUpdate } from "./array/diff.js";
	export { arrayDiff } from "./array/diff.js";
/* array/is-same.ts */
	// Identifiers (1)
	export { isArraySame } from "./array/is-same.js";
/* array/normalize.ts */
	// Identifiers (1)
	export { normalizeArray } from "./array/normalize.js";
/* array/sort-alpha.ts */
	// Identifiers (1)
	export { sortByString } from "./array/sort-alpha.js";
/* array/unique.ts */
	// Identifiers (4)
	export { arrayUnique } from "./array/unique.js";
	export { arrayUniqueReference } from "./array/unique.js";
	export type { IUniqueIdFactory } from "./array/unique.js";
	export { uniqueFilter } from "./array/unique.js";
/* date/consts.ts */
	// Identifiers (5)
	export { oneSecond } from "./date/consts.js";
	export { oneMinute } from "./date/consts.js";
	export { oneHour } from "./date/consts.js";
	export { oneDay } from "./date/consts.js";
	export { oneWeek } from "./date/consts.js";
/* date/is-invalid.ts */
	// Identifiers (1)
	export { isDateInvalid } from "./date/is-invalid.js";
/* date/sibling.ts */
	// Identifiers (7)
	export { nextSecond } from "./date/sibling.js";
	export { nextMinute } from "./date/sibling.js";
	export { nextHour } from "./date/sibling.js";
	export { nextDay } from "./date/sibling.js";
	export { nextWeek } from "./date/sibling.js";
	export { nextMonth } from "./date/sibling.js";
	export { nextYear } from "./date/sibling.js";
/* date/to-string.ts */
	// Identifiers (1)
	export { humanDate } from "./date/to-string.js";
/* date/unix.ts */
	// Identifiers (2)
	export { getTimeStamp } from "./date/unix.js";
	export { fromTimeStamp } from "./date/unix.js";
/* debugging/inspect.ts */
	// Identifiers (3)
	export { inspectSymbol } from "./debugging/inspect.js";
	export { defineInspectMethod } from "./debugging/inspect.js";
	export { tryInspect } from "./debugging/inspect.js";
/* debugging/object-with-name.ts */
	// Identifiers (10)
	export type { NamedObject } from "./debugging/object-with-name.js";
	export { objectName } from "./debugging/object-with-name.js";
	export { nameObject } from "./debugging/object-with-name.js";
	export type { MaybeNamed } from "./debugging/object-with-name.js";
	export { assertObjectHasName } from "./debugging/object-with-name.js";
	export type { NamedFunction } from "./debugging/object-with-name.js";
	export type { MaybeNamedFunction } from "./debugging/object-with-name.js";
	export { functionName } from "./debugging/object-with-name.js";
	export { nameFunction } from "./debugging/object-with-name.js";
	export { assertFunctionHasName } from "./debugging/object-with-name.js";
/* debugging/serializable.ts */
	// Identifiers (5)
	export { isScalar } from "./debugging/serializable.js";
	export { SerializableKind } from "./debugging/serializable.js";
	export { isSerializable } from "./debugging/serializable.js";
	export { getTypeOf } from "./debugging/serializable.js";
	export { assertSerializable } from "./debugging/serializable.js";
/* error/convert-unknown.ts */
	// Identifiers (1)
	export { convertCaughtError } from "./error/convert-unknown.js";
/* error/get-frame.ts */
	// Identifiers (1)
	export { getErrorFrame } from "./error/get-frame.js";
/* error/known.ts */
	// Identifiers (1)
	export { KnownError } from "./error/known.js";
/* error/pretty.nodejs.ts */
	// Identifiers (4)
	export { setErrorLogRoot } from "./error/pretty.nodejs.js";
	export { prettyPrintError } from "./error/pretty.nodejs.js";
	export { prettyFormatStack } from "./error/pretty.nodejs.js";
	export { prettyFormatError } from "./error/pretty.nodejs.js";
/* error/pretty.vscode.ts */
	// Identifiers (1)
	export { vscEscapeValue } from "./error/pretty.vscode.js";
/* error/stack-parser.v8.ts */
	// Identifiers (3)
	export { parseStackString } from "./error/stack-parser.v8.js";
	export type { IStructreStackLine } from "./error/stack-parser.v8.js";
	export { parseStackLine } from "./error/stack-parser.v8.js";
/* error/stack-trace.ts */
	// Identifiers (3)
	export type { StackTraceHolder } from "./error/stack-trace.js";
	export type { IWithStack } from "./error/stack-trace.js";
	export { createStackTraceHolder } from "./error/stack-trace.js";
/* function/callback-list.async.ts */
	// Identifiers (2)
	export type { MyAsyncCallback } from "./function/callback-list.async.js";
	export { AsyncCallbackList } from "./function/callback-list.async.js";
/* function/callback-list.delay.ts */
	// Identifiers (2)
	export type { MyDelayCallback } from "./function/callback-list.delay.js";
	export { MemorizedOnceCallbackList } from "./function/callback-list.delay.js";
/* function/callback-list.ts */
	// Identifiers (2)
	export type { MyCallback } from "./function/callback-list.js";
	export { CallbackList } from "./function/callback-list.js";
/* function/noop.ts */
	// Identifiers (1)
	export { noop } from "./function/noop.js";
/* iterate/merge-iterable.ts */
	// Identifiers (4)
	export { mergeIterables } from "./iterate/merge-iterable.js";
	export { joinAsyncIterables } from "./iterate/merge-iterable.js";
	export { interleaveIterables } from "./iterate/merge-iterable.js";
	export { interleaveAsyncIterables } from "./iterate/merge-iterable.js";
/* legacy/rename.ts */
	// Identifiers (4)
	export { toDisposable } from "./legacy/rename.js";
	export { AsyncDisposable } from "./legacy/rename.js";
	export { Disposable } from "./legacy/rename.js";
	export { convertCatchedError } from "./legacy/rename.js";
/* lifecycle/cancellation/driver.browser.ts */
	// Identifiers (0)
/* lifecycle/cancellation/driver.common.ts */
	// Identifiers (0)
/* lifecycle/cancellation/source.ts */
	// Identifiers (2)
	export type { CancellationToken } from "./lifecycle/cancellation/source.js";
	export { CancellationTokenSource } from "./lifecycle/cancellation/source.js";
/* lifecycle/dispose/async-disposable.ts */
	// Identifiers (2)
	export { EnhancedAsyncDisposable } from "./lifecycle/dispose/async-disposable.js";
	export { UnorderedAsyncDisposable } from "./lifecycle/dispose/async-disposable.js";
/* lifecycle/dispose/bridges/function.ts */
	// Identifiers (2)
	export { functionToDisposable } from "./lifecycle/dispose/bridges/function.js";
	export { disposerFunction } from "./lifecycle/dispose/bridges/function.js";
/* lifecycle/dispose/bridges/native.ts */
	// Identifiers (2)
	export { fromNativeDisposable } from "./lifecycle/dispose/bridges/native.js";
	export { toNativeDisposable } from "./lifecycle/dispose/bridges/native.js";
/* lifecycle/dispose/bridges/streams.ts */
	// Identifiers (2)
	export { closableToDisposable } from "./lifecycle/dispose/bridges/streams.js";
	export { endableToDisposable } from "./lifecycle/dispose/bridges/streams.js";
/* lifecycle/dispose/debug.ts */
	// Identifiers (0)
/* lifecycle/dispose/disposable.ts */
	// Identifiers (5)
	export { DuplicateDisposeAction } from "./lifecycle/dispose/disposable.js";
	export type { IDisposableEvents } from "./lifecycle/dispose/disposable.js";
	export type { IDisposable } from "./lifecycle/dispose/disposable.js";
	export type { IAsyncDisposable } from "./lifecycle/dispose/disposable.js";
	export { AbstractEnhancedDisposable } from "./lifecycle/dispose/disposable.js";
/* lifecycle/dispose/disposableEvent.ts */
	// Identifiers (4)
	export { addAnyKindOfListener } from "./lifecycle/dispose/disposableEvent.js";
	export type { IShorthandEmitterObject } from "./lifecycle/dispose/disposableEvent.js";
	export type { IEventEmitterObject } from "./lifecycle/dispose/disposableEvent.js";
	export { addDisposableEventListener } from "./lifecycle/dispose/disposableEvent.js";
/* lifecycle/dispose/disposedError.ts */
	// Identifiers (2)
	export { DisposedError } from "./lifecycle/dispose/disposedError.js";
	export { DuplicateDisposed } from "./lifecycle/dispose/disposedError.js";
/* lifecycle/dispose/sync-disposable.ts */
	// Identifiers (2)
	export { DisposableOnce } from "./lifecycle/dispose/sync-disposable.js";
	export { EnhancedDisposable } from "./lifecycle/dispose/sync-disposable.js";
/* lifecycle/event/event.ts */
	// Identifiers (1)
	export { Emitter } from "./lifecycle/event/event.js";
/* lifecycle/event/memorized.ts */
	// Identifiers (1)
	export { MemorizedEmitter } from "./lifecycle/event/memorized.js";
/* lifecycle/event/type.ts */
	// Identifiers (4)
	export type { IEventEmitter } from "./lifecycle/event/type.js";
	export type { EventHandler } from "./lifecycle/event/type.js";
	export type { EventRegister } from "./lifecycle/event/type.js";
	export type { EventEmitterMap } from "./lifecycle/event/type.js";
/* lifecycle/global/global-lifecycle.ts */
	// Identifiers (3)
	export { registerGlobalLifecycle } from "./lifecycle/global/global-lifecycle.js";
	export { ensureDisposeGlobal } from "./lifecycle/global/global-lifecycle.js";
	export { disposeGlobal } from "./lifecycle/global/global-lifecycle.js";
/* log/logger.ts */
	// Identifiers (3)
	export { ColorKind } from "./log/logger.js";
	export type { WrappedConsoleOptions } from "./log/logger.js";
	export { WrappedConsole } from "./log/logger.js";
/* map-and-set/custom-set.ts */
	// Identifiers (2)
	export type { Finder } from "./map-and-set/custom-set.js";
	export { CustomSet } from "./map-and-set/custom-set.js";
/* map-and-set/object-map.ts */
	// Identifiers (1)
	export { convertToMap } from "./map-and-set/object-map.js";
/* map-and-set/required-map.ts */
	// Identifiers (2)
	export { RequiredMap } from "./map-and-set/required-map.js";
	export { InstanceMap } from "./map-and-set/required-map.js";
/* misc/assertNotNull.ts */
	// Identifiers (1)
	export { assertNotNull } from "./misc/assertNotNull.js";
/* misc/package.json.ts */
	// Identifiers (9)
	export type { IExportCondition } from "./misc/package.json.js";
	export type { IExportMap } from "./misc/package.json.js";
	export type { IFullExportsField } from "./misc/package.json.js";
	export type { IExportsField } from "./misc/package.json.js";
	export type { IImportsField } from "./misc/package.json.js";
	export { parseExportsField } from "./misc/package.json.js";
	export { resolveExportPath } from "./misc/package.json.js";
	export type { IPackageJson } from "./misc/package.json.js";
	export type { IPackageJsonNpmDist } from "./misc/package.json.js";
/* object/definePublicConstant.ts */
	// Identifiers (2)
	export { definePublicConstant } from "./object/definePublicConstant.js";
	export { definePrivateConstant } from "./object/definePublicConstant.js";
/* object/initOnRead.ts */
	// Identifiers (2)
	export type { InitFunc } from "./object/initOnRead.js";
	export { initOnRead } from "./object/initOnRead.js";
/* object/objectPath.ts */
	// Identifiers (2)
	export { objectPath } from "./object/objectPath.js";
	export { ObjectPath } from "./object/objectPath.js";
/* object/objectSame.ts */
	// Identifiers (2)
	export { isObjectSame } from "./object/objectSame.js";
	export { isObjectSameRecursive } from "./object/objectSame.js";
/* path/isAbsolute.ts */
	// Identifiers (1)
	export { isAbsolute } from "./path/isAbsolute.js";
/* path/normalizePath.ts */
	// Identifiers (5)
	export { PathKind } from "./path/normalizePath.js";
	export type { IPathInfo } from "./path/normalizePath.js";
	export { analyzePath } from "./path/normalizePath.js";
	export { normalizePath } from "./path/normalizePath.js";
	export { relativePath } from "./path/normalizePath.js";
/* path/pathArray.ts */
	// Identifiers (3)
	export { PathArrayWindows } from "./path/pathArray.js";
	export { PathArrayPosix } from "./path/pathArray.js";
	export { PathArray } from "./path/pathArray.js";
/* path/pathCalc.ts */
	// Identifiers (1)
	export { isPathContains } from "./path/pathCalc.js";
/* platform/compile.ts */
	// Identifiers (2)
	export { isProductionMode } from "./platform/compile.js";
	export { isBuildMode } from "./platform/compile.js";
/* platform/globalObject.ts */
	// Identifiers (2)
	export { globalObject } from "./platform/globalObject.js";
	export { ensureGlobalObject } from "./platform/globalObject.js";
/* platform/globalSingleton.ts */
	// Identifiers (3)
	export { globalSingletonStrong } from "./platform/globalSingleton.js";
	export { globalSingletonDelete } from "./platform/globalSingleton.js";
	export { globalSingleton } from "./platform/globalSingleton.js";
/* platform/globalSymbol.ts */
	// Identifiers (2)
	export { createSymbol } from "./platform/globalSymbol.js";
	export { deleteSymbol } from "./platform/globalSymbol.js";
/* platform/os.ts */
	// Identifiers (16)
	export { hasProcess } from "./platform/os.js";
	export { hasWindow } from "./platform/os.js";
	export { hasGlobal } from "./platform/os.js";
	export { isElectron } from "./platform/os.js";
	export { isElectronSandbox } from "./platform/os.js";
	export { isElectronRenderer } from "./platform/os.js";
	export { isElectronMain } from "./platform/os.js";
	export { isWindows } from "./platform/os.js";
	export { isMacintosh } from "./platform/os.js";
	export { isLinux } from "./platform/os.js";
	export { isNative } from "./platform/os.js";
	export { isNodeJs } from "./platform/os.js";
	export { isWeb } from "./platform/os.js";
	export { is64Bit } from "./platform/os.js";
	export { sepList } from "./platform/os.js";
	export { is32Bit } from "./platform/os.js";
/* promise/await-iterator.ts */
	// Identifiers (1)
	export { awaitIterator } from "./promise/await-iterator.js";
/* promise/deferred-promise.ts */
	// Identifiers (4)
	export type { ValueCallback } from "./promise/deferred-promise.js";
	export type { ProgressCallback } from "./promise/deferred-promise.js";
	export type { IProgressHolder } from "./promise/deferred-promise.js";
	export { DeferredPromise } from "./promise/deferred-promise.js";
/* promise/promise-bool.ts */
	// Identifiers (1)
	export { promiseBool } from "./promise/promise-bool.js";
/* promise/promise-list.ts */
	// Identifiers (1)
	export { PromiseCollection } from "./promise/promise-list.js";
/* re-export.ts */
	// Identifiers (0)
	// References (1)
	export * from "@idlebox/errors";
/* reflection/classes/pointer.ts */
	// Identifiers (2)
	export type { Ref } from "./reflection/classes/pointer.js";
	export { Pointer } from "./reflection/classes/pointer.js";
/* reflection/classes/singleton.ts */
	// Identifiers (4)
	export { singletonSymbol } from "./reflection/classes/singleton.js";
	export { SingletonType } from "./reflection/classes/singleton.js";
	export { singleton } from "./reflection/classes/singleton.js";
	export { createSingleton } from "./reflection/classes/singleton.js";
/* reflection/methods/bind.ts */
	// Identifiers (1)
	export { bindThis } from "./reflection/methods/bind.js";
/* reflection/methods/memorize.ts */
	// Identifiers (2)
	export { memo } from "./reflection/methods/memorize.js";
	export { forgetMemorized } from "./reflection/methods/memorize.js";
/* schedule/extendable-timer.ts */
	// Identifiers (1)
	export { ExtendableTimer } from "./schedule/extendable-timer.js";
/* schedule/interval.ts */
	// Identifiers (2)
	export { interval } from "./schedule/interval.js";
	export { Interval } from "./schedule/interval.js";
/* schedule/local-type.ts */
	// Identifiers (2)
	export type { TimeoutType } from "./schedule/local-type.js";
	export type { IntervalType } from "./schedule/local-type.js";
/* schedule/scheduler.ts */
	// Identifiers (1)
	export { scheduler } from "./schedule/scheduler.js";
/* schedule/timeout.ts */
	// Identifiers (3)
	export { timeout } from "./schedule/timeout.js";
	export { sleep } from "./schedule/timeout.js";
	export { raceTimeout } from "./schedule/timeout.js";
/* state/simple-state-machine.ts */
	// Identifiers (3)
	export type { ISsmRuleMap } from "./state/simple-state-machine.js";
	export type { IStateChangeEvent } from "./state/simple-state-machine.js";
	export { SimpleStateMachine } from "./state/simple-state-machine.js";
/* string/case-cast.ts */
	// Identifiers (5)
	export { camelCase } from "./string/case-cast.js";
	export { ucfirst } from "./string/case-cast.js";
	export { lcfirst } from "./string/case-cast.js";
	export { linux_case } from "./string/case-cast.js";
	export { linux_case_hyphen } from "./string/case-cast.js";
/* string/concatType.generated.ts */
	// Identifiers (1)
	export { concatStringType } from "./string/concatType.generated.js";
/* string/escape-regexp.ts */
	// Identifiers (1)
	export { escapeRegExp } from "./string/escape-regexp.js";
/* string/human-bytes.ts */
	// Identifiers (3)
	export { humanSizeSI } from "./string/human-bytes.js";
	export { humanSize } from "./string/human-bytes.js";
	export { humanSpeed } from "./string/human-bytes.js";
/* string/pad2.ts */
	// Identifiers (1)
	export { pad2 } from "./string/pad2.js";
/* typing-helper/callback.ts */
	// Identifiers (1)
	export type { ICommonCallback } from "./typing-helper/callback.js";
/* typing-helper/deep.partial.ts */
	// Identifiers (1)
	export type { DeepPartial } from "./typing-helper/deep.partial.js";
/* typing-helper/deep.readonly.ts */
	// Identifiers (1)
	export type { DeepReadonly } from "./typing-helper/deep.readonly.js";
/* typing-helper/deep.required.ts */
	// Identifiers (1)
	export type { DeepNonNullable } from "./typing-helper/deep.required.js";
/* typing-helper/deep.writable.ts */
	// Identifiers (1)
	export type { DeepWriteable } from "./typing-helper/deep.writable.js";
/* typing-helper/literal.ts */
	// Identifiers (1)
	export type { Primitive } from "./typing-helper/literal.js";