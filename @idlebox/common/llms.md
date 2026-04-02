# Usage
<!-- last update: 2026-04-03 -->

`@idlebox/common` 是一个通用 TypeScript 工具函数库，提供数组操作、日期格式化、调试辅助、错误处理、事件系统、生命周期/资源管理 (Disposable)、路径处理、平台检测、Promise 工具、反射、定时器等功能。`@idlebox/errors` 提供错误类型体系和错误代码枚举，与 `@idlebox/common` 深度集成。

### array/chunk

##### arrayChunk

将数组按指定大小分割为多个子数组的生成器函数。

**类型:** `<T>(arr: T[], size: number) => Generator<T[]>`

**参数:**
- `arr` — 要分割的数组
- `size` — 每个子数组的最大长度

**返回:** 依次产出每个子数组，最后一个子数组长度可能小于 `size`。

**示例:**
```typescript
for (const chunk of arrayChunk([1, 2, 3, 4, 5], 2)) {
  console.log(chunk); // [1,2], [3,4], [5]
}
```

### array/diff

##### arrayDiff

比较两个数组，返回从 `before` 到 `after` 的变化。

**类型:** `<T>(before: readonly T[], after: readonly T[]) => IArrayUpdate<T>`

**参数:**
- `before` — 变更前的数组
- `after` — 变更后的数组

**返回:** `IArrayUpdate<T>` 对象，包含三个字段:
- `add` — 新增的元素
- `del` — 删除的元素
- `same` — 未变化的元素

**示例:**
```typescript
const result = arrayDiff(['a', 'b', 'c'], ['b', 'c', 'd']);
// result.add = ['d'], result.del = ['a'], result.same = ['b', 'c']
```

### array/is-same

##### isArraySame

判断两个数组是否完全相同 (元素顺序和引用均相同)。

**类型:** `<T>(a1: readonly T[], a2: readonly T[]) => boolean`

### array/normalize

##### normalizeArray

将值统一转为数组形式。如果传入 `undefined`，则返回空数组。

**类型:** `<T>(input: T | T[]) => T[]`

### array/sort-alpha

##### sortByString

按字母顺序排序的比较函数，用于 `Array.prototype.sort()`。

**类型:** `(a: string, b: string) => number`

### array/unique

##### arrayUnique

返回去除重复元素后的新数组 (保留最后一次出现)。

**类型:** `<T>(arr: readonly T[]) => T[]`

##### arrayUniqueReference

原地从数组中删除重复元素 (保留最后一次出现)。

**类型:** `(arr: any[]) => void`

##### uniqueFilter

返回一个可用于 `Array.prototype.filter()` 的函数，过滤已见过的元素。该函数可在多个数组间复用。

**类型:** `<T>(idFactory?: IUniqueIdFactory<T>) => (item: T) => boolean`

### date/consts

##### oneSecond / oneMinute / oneHour / oneDay / oneWeek

以毫秒为单位的时间常量: `oneSecond=1000`，`oneMinute=60000`，`oneHour=1440000`，`oneDay=86400000`，`oneWeek=604800000`。

### date/is-invalid

##### isDateInvalid

检查 `Date` 对象是否为无效日期 (即 `NaN`)。

**类型:** `(date: Date) => boolean`

### date/sibling

##### nextSecond / nextMinute / nextHour / nextDay / nextWeek / nextMonth / nextYear

对 `Date` 对象就地加减指定单位数量。签名: `(d: Date, n?: number) => Date`

### date/to-string

##### humanDate

日期/时间格式化工具集合 (namespace)，包含 `time`、`date`、`datetime`、`deltaTiny`、`delta`、`setLocaleFormatter` 方法。

### date/unix

##### getTimeStamp

将 `Date` 转换为 Unix 时间戳 (秒)。**类型:** `(date: Date) => number`

##### fromTimeStamp

将 Unix 时间戳 (秒) 转换为 `Date`。**类型:** `(timestamp: number) => Date`

### debugging/inspect

##### inspectSymbol

Node.js 自定义 inspect 的 Symbol: `Symbol.for('nodejs.util.inspect.custom')`。

##### defineInspectMethod

为对象定义自定义 inspect 方法。**类型:** `<T>(obj: T, method: Function) => T`

##### tryInspect

尝试将对象转换为可读字符串，依次尝试多种方式。**类型:** `(object: any) => string`

### debugging/object-with-name

##### objectName

获取对象的 `displayName` 或 `name`。**类型:** `<T>(func: NonNullable<T>) => string | undefined`

##### nameObject

为对象设置 `displayName` 和 `Symbol.toStringTag`。**类型:** `<T>(name: string, object: T) => T & NamedObject`

##### assertObjectHasName

断言对象必须有名称属性。**类型:** `<T>(func: NonNullable<T>) => asserts func is T & NamedObject`

##### functionName

获取函数名，无名称时返回 `'<anonymous>'`。**类型:** `(func: Function) => string`

### debugging/serializable

##### isScalar

判断值是否为标量类型。**类型:** `(value: any) => value is ScalarTypes`

##### SerializableKind

序列化状态枚举: `Invalid`(0)、`Primitive`(1)、`Manual`(2)、`Other`(3)。

##### isSerializable

检查值的序列化状态。**类型:** `(value: any) => SerializableKind`

##### getTypeOf

返回值的精细类型字符串。**类型:** `(value: any) => string`

##### assertSerializable

断言对象可序列化，发现不可序列化值则抛出 `TypeError`。**类型:** `(value: any) => void`

### error/cause

##### getRootCause

沿 `cause` 链返回最终根因错误。**类型:** `(e: Error) => Error`

##### getCauseStack

返回完整 cause 链数组。**类型:** `(e: Error) => Error[]`

### error/convert-unknown

##### convertCaughtError

将 `catch` 捕获的任意值转换为 `Error`。`Exit` 错误会被重新抛出。**类型:** `(e: unknown) => Error`

### error/get-frame

##### getErrorFrame

从 `Error.stack` 中取出第 N 帧字符串。**类型:** `(e: IWithStack, frame: number, downIfEmpty?: boolean) => string`

### error/pretty.nodejs

##### setErrorLogRoot

设置错误格式化时的根目录。**类型:** `(root: string) => void`

##### prettyPrintError

在控制台格式化打印错误。**类型:** `<E>(type: string, e: E) => void`

##### prettyFormatStack

格式化堆栈行数组为带颜色的可读字符串数组。**类型:** `(stackLines: readonly string[]) => string[]`

##### prettyFormatError

格式化错误为字符串。**类型:** `<E>(e: E, withMessage?: boolean) => string`

### error/pretty.vscode

##### vscEscapeValue

对字符串进行 VSCode Shell Integration 协议转义。**类型:** `(input: string) => string`

### error/stack-parser.v8

##### parseStackLine

解析一行 V8 stack trace 为 `IStructreStackLine`。**类型:** `(line: string) => IStructreStackLine`

##### parseStackString

解析完整多行 stack trace。**类型:** `(stack: string) => IStructreStackLine[]`

### error/stack-trace

##### createStackTraceHolder

创建保存当前调用堆栈的对象。**类型:** `(message: string, boundary?: any) => StackTraceHolder`

### function/callback-list

##### CallbackList

管理同步回调列表的类，回调返回 `false` 时中止执行。成员: `add`、`remove`、`run`、`reset`、`count`。

### function/callback-list.async

##### AsyncCallbackList

异步逐一执行回调的列表类，回调返回 `true` 时中止。成员: `add`、`remove`、`run`、`reset`、`count`。

### function/callback-list.delay

##### MemorizedOnceCallbackList

运行后记忆参数，后续添加的回调立即被调用的回调列表。成员: `add`、`run`、`count`。

### function/noop

##### noop

空函数。**类型:** `() => void`

### iterate/merge-iterable

##### mergeIterables

顺序合并多个可迭代对象。**类型:** `<T>(...iterables: Iterable<T>[]) => Generator<T>`

##### joinAsyncIterables

顺序合并多个同步/异步可迭代对象。**类型:** `<T>(...iterables: ...) => AsyncGenerator<T>`

##### interleaveIterables

交错合并多个可迭代对象 (轮流取元素)。**类型:** `<T>(...iterables: Iterable<T>[]) => Generator<T>`

##### interleaveAsyncIterables

交错合并多个同步/异步可迭代对象。

### lifecycle/cancellation/source

##### CancellationToken

取消令牌接口 (只读): `isCancellationRequested`、`onCancellationRequested`。

##### CancellationTokenSource

取消令牌控制端。成员: `token`、`cancel()`、`dispose()`。

### lifecycle/dispose/async-disposable

##### EnhancedAsyncDisposable

异步资源容器，按注册逆序释放，支持错误事件。实现 `[Symbol.asyncDispose]`。

##### UnorderedAsyncDisposable

并发释放所有资源且忽略错误的异步 Disposable。

### lifecycle/dispose/bridges/function

##### functionToDisposable

将释放函数包装为 `IDisposable` 或 `IAsyncDisposable`。

##### disposerFunction

将 Disposable 对象转换为普通函数，适合 React `useEffect` 返回值。

### lifecycle/dispose/bridges/native

##### fromNativeDisposable

将原生 `Symbol.dispose`/`Symbol.asyncDispose` 对象转换为本包 Disposable 格式。

##### toNativeDisposableAsync / toNativeDisposableSync

将本包 Disposable 转换为原生格式。

### lifecycle/dispose/bridges/streams

##### closableToDisposable

将有 `close()` 方法的对象转换为 `IAsyncDisposable`。

##### endableToDisposable

将有 `end()` 方法的对象转换为 `IAsyncDisposable`。

### lifecycle/dispose/disposable

##### IDisposable

同步 disposable 接口: `{ dispose(): void }`。

##### IAsyncDisposable

异步 disposable 接口: `{ dispose(): void | Promise<void> }`。

##### AbstractEnhancedDisposable

增强型 Disposable 抽象基类，提供 `_register`/`_unregister`、事件 (`onDisposeError`、`onBeforeDispose`、`onPostDispose`)、`disposed`/`disposing` 状态等。

##### DuplicateDisposeAction

重复 dispose 行为枚举: `Disable`(0)、`Warning`(1)、`Allow`(2)。

### lifecycle/dispose/disposableEvent

##### addDisposableEventListener

为事件发射器添加可 dispose 的监听器。

### lifecycle/dispose/disposedError

##### DuplicateDisposedError

重复 dispose 时的错误，包含 `consoleWarning()` 方法输出彩色警告。

### lifecycle/dispose/sync-disposable

##### DisposableOnce

防重复 dispose 的简单抽象 Disposable 基类。

##### EnhancedDisposable

完整同步 Disposable 类，实现 `[Symbol.dispose]`，参见 `AbstractEnhancedDisposable`。

### lifecycle/event/event

##### Emitter

事件发射器类。成员: `handle`、`once`、`wait`、`fire`、`register`/`event`、`listenerCount`、`disposed`、`dispose`。`fire` 错误策略: `EAction.Throw`/`Delay`/`Ignore`/`PrintIgnore`。

### lifecycle/event/memorized

##### MemorizedEmitter

记忆上次 `fire` 数据的 Emitter，新监听器注册时立即调用一次。额外成员: `forget()`。

### lifecycle/event/type

##### EventHandler

`(data: T) => void`

##### EventRegister

已 bind 的事件注册函数接口，支持 `once`、`wait`、`disposed`。

##### IEventEmitter

完整事件发射器接口。

##### EventEmitterMap

将类型映射转为 Emitter map 类型。

### lifecycle/global/global-lifecycle

##### registerGlobalLifecycle

注册对象到全局 Disposable 容器。

##### disposeGlobal

释放全局容器 (需手动调用，重复调用抛错)。

##### ensureDisposeGlobal

安全版 `disposeGlobal`，重复调用不抛错。

### log/logger

##### WrappedConsole

带标题前缀的 Console 抽象基类，子类实现颜色格式化。

##### ColorKind

颜色模式枚举: `DISABLE`(0)、`TERMINAL`(1)、`WEB`(2)、`DETECT`(3)。

### map-and-set/custom-set

##### CustomSet

使用自定义比较函数的 Set 抽象基类。成员: `has`、`add`、`addAll`、`delete`、`deleteAll`、`clear`、`length`、`toArray`。

### map-and-set/object-map

##### convertToMap

将普通对象转换为 `Map`。**类型:** `<K, V>(object: Record<K, V>) => Map<K, V>`

### map-and-set/required-map

##### RequiredMap

`get()` 在键不存在时抛错的 Map。额外方法: `entry(id, init)`。

##### InstanceMap

`get()` 在键不存在时自动创建实例的 Map 抽象基类，需实现 `instance(key)`。

### misc/assertNotNull

##### assertNotNull

断言值非 null/undefined/NaN，返回 `NonNullable<T>`。

### misc/package.json

##### IPackageJson

`package.json` 完整类型定义，含标准 npm 字段及自定义扩展字段。

##### parseExportsField

解析 `package.json` 的 `exports` 字段。

##### resolveExportPath

根据条件列表解析导出路径。

### object/definePublicConstant

##### definePublicConstant

定义不可修改的公开属性 (enumerable)。

##### definePrivateConstant

定义不可修改的私有属性 (non-enumerable)。

### object/initOnRead

##### initOnRead

在 prototype 上定义懒初始化属性，首次访问时执行并缓存。

### object/objectPath

##### objectPath

通过 `.` 分隔路径字符串读取对象深层属性。

##### ObjectPath

基于路径数组对对象进行读写操作的工具类。成员: `get`、`exists`、`set`。

### object/objectSame

##### isObjectSame

浅比较两个对象是否完全相同 (键和值)。

##### isObjectSameRecursive

深度递归比较两个对象是否完全相同。

### path/isAbsolute

##### isAbsolute

判断路径是否为绝对路径 (支持 Unix、Windows、UNC、URL)。

### path/normalizePath

##### PathKind

路径类型枚举: `url`(0)、`unc`(1)、`win`(2)、`cifs`(3)、`unix`(4)、`relative`(5)。

##### analyzePath

解析路径为 `IPathInfo` 对象，包含 `kind`、`prefix`、`path`。

##### normalizePath

规范化路径 (统一分隔符、处理 `..`/`.`)。

##### relativePath

计算两个同类型路径之间的相对路径。

### path/pathArray

##### PathArray / PathArrayPosix / PathArrayWindows

PATH 环境变量格式处理工具类，根据平台自动选择。成员: `add`、`delete`、`has`、`toString`、`toArray`、`joinpath`、`clear`、`size`。

### path/pathCalc

##### isPathContains

检查两个路径是否存在父子关系。

### platform/compile

##### isProductionMode / isBuildMode

编译时环境检测变量，读取 `import.meta.env`。

### platform/globalObject

##### globalObject

全局对象 (`globalThis`/`window`/`global`)。

##### ensureGlobalObject / ensureGlobalObjectSingleton

获取或创建全局对象上的属性。

### platform/globalSingleton

##### globalSingletonStrong

从全局注册表获取或创建强引用单例。

##### globalSingleton

从全局注册表获取或创建弱引用单例 (可被 GC 回收)。

##### globalSingletonDelete

从全局注册表删除键。

### platform/globalSymbol

##### createSymbol

创建或获取分类命名 Symbol。

##### deleteSymbol

删除全局 Symbol。

### platform/os

##### hasProcess / hasWindow / hasGlobal

运行环境检测。

##### isElectron / isElectronRenderer / isElectronMain / isElectronSandbox

Electron 环境检测。

##### isWindows / isMacintosh / isLinux / isNative / isNodeJs / isWeb / is64Bit / is32Bit / isV8

平台和引擎检测变量。

##### sepList

当前平台的 PATH 分隔符。

### promise/await-iterator

##### awaitIterator

将 Iterator 转换为 Promise，resolve 返回最后一个值。

### promise/deferred-promise

##### DeferredPromise

可延迟 resolve/reject 的 Promise 容器，支持进度通知和超时。静态方法: `DeferredPromise.wrap(prev)`。

### promise/is-promise

##### isPromiseLike

判断值是否为 `PromiseLike`。

### promise/promise-bool

##### promiseBool

Promise 转布尔: resolve→true，reject→false (丢弃错误)。

### promise/promise-list

##### PromiseCollection

以字符串 ID 管理 DeferredPromise 集合。成员: `create`、`has`、`done`、`error`、`dispose`、`size`。

### reflection/classes/pointer

##### Pointer

创建透明 Proxy，所有操作代理到 `ref.reference` 的对象。

### reflection/classes/singleton

##### singleton

类装饰器，使类成为单例。

##### createSingleton

手动创建并缓存类的单例实例。

### reflection/methods/bind

##### bindThis

方法装饰器，自动将方法 bind 到实例。

### reflection/methods/memorize

##### memo

方法装饰器，记忆第一次调用的返回值。

##### forgetMemorized

清除 `@memo` 装饰的方法缓存。

### schedule/extendable-timer

##### ExtendableTimer

可反复推迟触发的定时器 (防抖)。成员: `start`、`renew`、`cancel`、`p`、`dispose`。

### schedule/interval

##### interval

创建 setInterval 定时器，返回可 dispose 的对象。

##### Interval

可暂停/恢复的定时器类。成员: `onTick`、`resume`、`pause`、`reset`、`fire`。

### schedule/scheduler

##### scheduler

跨平台微任务调度: Node.js 用 `process.nextTick`，浏览器用 `queueMicrotask`。

### schedule/timeout

##### timeout

指定毫秒后 reject `TimeoutError` 的 Promise。

##### sleep

指定毫秒后 resolve 的 Promise。

##### raceTimeout

与超时竞争的 Promise。

### state/simple-state-machine

##### SimpleStateMachine

简单状态机，基于规则映射驱动状态转移，触发 `onStateChange` 事件。

### string/case-cast

##### camelCase / ucfirst / lcfirst / linux_case / linux_case_hyphen

字符串大小写转换工具函数。

### string/escape-regexp

##### escapeRegExp

对字符串中的正则特殊字符进行转义。

### string/human-bytes

##### humanSize

字节数转可读字符串 (二进制前缀 1024)，如 `1.50GiB`。

##### humanSizeSI

字节数转可读字符串 (SI 前缀 1000)，如 `1.50GB`。

### string/pad2

##### pad2

数字填充为两位字符串，不足补 `'0'`，用于时间格式化。

### typing-helper/callback

##### ICommonCallback

Node.js 风格错误优先回调接口。

### typing-helper/deep.partial

##### DeepPartial

深度将所有属性变为可选。

### typing-helper/deep.readonly

##### DeepReadonly

深度将所有属性变为只读。

### typing-helper/deep.required

##### DeepNonNullable

深度去除所有属性的 null/undefined。

### typing-helper/deep.writable

##### DeepWriteable

深度去除所有 `readonly` 修饰符。

##### Writeable

浅层去除 `readonly` 修饰符。

### typing-helper/literal

##### Primitive

基本类型联合，用于深度类型工具的递归终止。

### codes/linux-error-codes

##### LinuxErrorCode

Linux POSIX 标准错误代码枚举，值为字符串形式，可与 `ErrnoException.code` 配合使用。

### codes/wellknown-exit-codes

##### ExitCode

常见进程退出码枚举: `SUCCESS`(0)、`EXECUTION`(1)、`INTERRUPT`(2)、`USAGE`(3)、`TIMEOUT`(4)、`INVALID_STATE`(5)、`PROGRAM`(66)、`RESOURCE`(100)、`DUPLICATE`(101)、`UNKNOWN`(233)。

### common/base

##### ErrorWithCode

所有自定义错误的基类，含 `code` 属性。构造参数: `(message, code, opts?)`。

##### TypeErrorWithCode

同时满足 `instanceof TypeError` 和 `instanceof ErrorWithCode` 的错误类型。

### common/human-readable

##### humanReadable

表示人类可读信息方法的 Symbol。

##### IHumanReadable

可提供人类可读信息的接口: `[humanReadable](): string`。

##### isHumanReadable

判断值是否实现 `IHumanReadable`。

### common/not-error

##### NotError

"没有错误"的特殊对象，用于 try/catch 接口的非错误分支传递。

### common/type

##### IErrorOptions

自定义错误构造选项: `boundary`、`cause`、`stack`。

### error-types/application

##### Exit

程序正常退出错误，捕获后应直接重新抛出。

##### Quit

`Exit` 的子类，退出码 0。

##### InterruptError

SIGINT/SIGTERM 中断错误。

##### UsageError

参数/配置错误。

### error-types/dependency

##### DependencyError

依赖项错误。

##### ChildProcessExitError

子进程意外退出错误，含 `pid`、`commandline`、`exitCode`、`signal` 等字段。

### error-types/development

##### ProgramError

程序 bug 抽象基类，退出码 66。

##### NotImplementedError / SoftwareDefectError / InvalidStateError

程序缺陷相关错误类型。

##### Assertion

提供 `Assertion.ok(value, message?)` 断言方法的类。

##### VariableTypeError

变量类型错误。

### error-types/nodejs

##### NodeException

带泛型错误码的 Node.js `ErrnoException` 类型。

##### isModuleResolutionError / isNotExistsError / isExistsError / isFileTypeError / isNodeError

Node.js 错误类型判断函数。

### error-types/nodejs.unhandled

##### UnhandledRejection

未处理的 Promise rejection 包装错误。

##### UncaughtException

未捕获异常包装错误。

### error-types/tools

##### CanceledError

操作被主动取消的错误。静态方法: `CanceledError.is(e)`。

##### TimeoutError

操作超时错误，构造参数: `(ms, why?, opts?)`。静态方法: `TimeoutError.is(e)`。
