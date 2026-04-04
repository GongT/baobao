# Usage
<!-- last update: 2026-04-04 -->

通用 TypeScript 工具库，提供数组/日期/字符串操作、错误处理体系、生命周期管理（Disposable/Event/Cancellation）、Promise 工具、平台检测、调度器、反射工具、类型工具等基础设施；同时集成了结构化错误类型（Exit/Timeout/Canceled/NodeException 等）和错误码定义（NodeErrorCode/OpenSSLErrorCode）。

<!-- File: array/chunk.md -->

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

<!-- File: array/diff.md -->

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

<!-- File: array/is-same.md -->

##### isArraySame

判断两个数组是否完全相同 (元素顺序和引用均相同)。

**类型:** `<T>(a1: readonly T[], a2: readonly T[]) => boolean`

**参数:**
- `a1` — 第一个数组
- `a2` — 第二个数组

**返回:** 两个数组长度相同且每个对应位置元素严格相等 (`===`) 时返回 `true`，否则返回 `false`。

<!-- File: array/normalize.md -->

##### normalizeArray

将值统一转为数组形式。如果传入 `undefined`，则返回空数组。

**类型:** `<T>(input: T | T[]) => T[]`

**参数:**
- `input` — 单个值或数组

**返回:** 若 `input` 已是数组则原样返回；若是单个值则包裹为单元素数组；若是 `undefined` 则返回 `[]`。

<!-- File: array/sort-alpha.md -->

##### sortByString

按字母顺序排序的比较函数，用于 `Array.prototype.sort()`。

**类型:** `(a: string, b: string) => number`

**示例:**
```typescript
['banana', 'apple', 'cherry'].sort(sortByString);
// ['apple', 'banana', 'cherry']
```

<!-- File: array/unique.md -->

##### arrayUnique

返回去除重复元素后的新数组 (保留最后一次出现)。

**类型:** `<T>(arr: readonly T[]) => T[]`

---

##### arrayUniqueReference

原地从数组中删除重复元素 (保留最后一次出现)。

**类型:** `(arr: any[]) => void`

---

##### uniqueFilter

返回一个可用于 `Array.prototype.filter()` 的函数，过滤已见过的元素。该函数可在多个数组间复用，会记住所有已见元素。

**类型:** `<T>(idFactory?: IUniqueIdFactory<T>) => (item: T) => boolean`

**参数:**
- `idFactory` — 可选，将元素转换为唯一 id 字符串的函数，默认直接将元素强转为字符串

**示例:**
```typescript
const filter = uniqueFilter<{ id: number }>(item => String(item.id));
const result = [...arr1, ...arr2].filter(filter);
```

<!-- File: codes/linux-error-codes.md -->

##### LinuxErrorCode

Linux POSIX 标准错误代码枚举，值为字符串形式的错误码名称 (如 `'ENOENT'`)。

包含 POSIX 标准错误码及 Linux 扩展错误码，可与 Node.js `ErrnoException.code` 配合使用。

**类型:** `enum LinuxErrorCode`

常见值: `EPERM`、`ENOENT`、`EACCES`、`EEXIST`、`EISDIR`、`ENOTDIR`、`ECONNREFUSED`、`ETIMEDOUT` 等。

<!-- File: codes/nodejs-re-export.md -->

将 `@idlebox/node-error-codes` 的 `NodeErrorCode` 和 `OpenSSLErrorCode` 重新导出，作为 `@idlebox/errors`（进而 `@idlebox/common`）的一部分。

<!-- File: codes/wellknown-exit-codes.md -->

##### ExitCode

常见进程退出码枚举:

| 值 | 含义 |
|---|---|
| `SUCCESS` (0) | 正常退出 |
| `EXECUTION` (1) | 运行时错误 |
| `INTERRUPT` (2) | 收到中断信号 |
| `USAGE` (3) | 参数使用错误 |
| `TIMEOUT` (4) | 未处理的超时 |
| `INVALID_STATE` (5) | 工作状态异常 |
| `PROGRAM` (66) | 程序代码缺陷 |
| `RESOURCE` (100) | 资源错误 |
| `DUPLICATE` (101) | 重复操作 |
| `UNKNOWN` (233) | 未曾设想的错误 |

<!-- File: common/base.md -->

## 错误基类

此模块是 `@idlebox/errors` 私有包的内容，通过 `@idlebox/common` 导出。

#### ErrorWithCode

最基本的错误类型，所有自定义错误的基类。携带数字类型的错误码 `code`。

```typescript
class ErrorWithCode extends Error {
  constructor(message: string, code: number, opts?: IErrorOptions);
  readonly code: number;
  get name(): string;  // 返回构造函数名称
}
```

**参数说明**
- `opts.stack` — 提供自定义 stack 字符串时，会替换默认的堆栈追踪
- `opts.boundary` — 自定义 `captureStackTrace` 的边界函数，默认为构造函数本身

#### TypeErrorWithCode

同时具有 `Error` 和 `TypeError` 特征的错误类型，`instanceof TypeError` 检查会返回 `true`。

```typescript
class TypeErrorWithCode extends ErrorWithCode {}
```

<!-- File: common/human-readable.md -->

##### humanReadable

表示人类可读错误信息方法的 Symbol。

**类型:** `symbol`

---

##### IHumanReadable

表示对象可提供人类可读错误信息的接口。

```typescript
interface IHumanReadable {
  [humanReadable](): string;
}
```

---

##### isHumanReadable

判断值是否实现了 `IHumanReadable` 接口。

**类型:** `(error: unknown) => error is IHumanReadable`

<!-- File: common/not-error.md -->

##### NotError

表示"没有错误"的特殊对象，用于通过 try/catch 接口传递非错误分支。

**类型:** `class NotError implements IHumanReadable`

构造函数: `constructor(extra_message?: string)`

注意: 此对象不是真正的 `Error`，访问其 `stack` 或 `message` 属性会抛出错误，提示开发者未正确捕获。

<!-- File: common/type.md -->

##### IErrorOptions

自定义错误构造选项接口:

| 字段 | 类型 | 说明 |
|---|---|---|
| `boundary` | `CallableFunction?` | stack trace 边界函数 |
| `cause` | `unknown?` | 错误的 cause |
| `stack` | `string?` | 替换 stack 字符串 |

<!-- File: common/type-shim.md -->

Node.js 类型兼容层

##### ChildProcess

`type` - 等同于 `import('node:child_process').ChildProcess`, 用于跨平台类型引用

##### SignalsType

`type` - 等同于 `NodeJS.Signals`, 用于跨平台类型引用

<!-- File: common/v8.md -->

此文件为 `@internal` 实现，对 `Error.captureStackTrace` 进行了安全封装（若不存在则使用空函数），不导出公开 API。

<!-- File: date/consts.md -->

常用时间常量, 单位为毫秒(ms)

##### oneSecond

`number` = `1000`

1秒对应的毫秒数

##### oneMinute

`number` = `60000`

1分钟对应的毫秒数

##### oneHour

`number` = `3600000`

1小时对应的毫秒数

##### oneDay

`number` = `86400000`

1天对应的毫秒数

##### oneWeek

`number` = `604800000`

1周对应的毫秒数

<!-- File: date/is-invalid.md -->

##### isDateInvalid

检查 `Date` 对象是否为无效日期 (即 `NaN`)。

**类型:** `(date: Date) => boolean`

<!-- File: date/sibling.md -->

##### nextSecond / nextMinute / nextHour / nextDay / nextWeek / nextMonth / nextYear

对 `Date` 对象就地加减指定单位数量，并返回同一对象。

**共同签名:** `(d: Date, n?: number) => Date`

**参数:**
- `d` — 要修改的 Date 对象 (原地修改)
- `n` — 步数，默认为 `1`，可传负数表示向前

**示例:**
```typescript
const d = new Date('2024-01-01');
nextDay(d, 7); // d 变为 2024-01-08
nextMonth(d, -1); // d 变为 2023-12-08
```

<!-- File: date/to-string.md -->

##### humanDate

日期/时间格式化工具集合 (namespace)。

**humanDate.time(date)**
格式化为 `HH:mm:ss`。参数可以是 `Date`、时间戳数字或数字字符串。

**humanDate.date(date, sp?)**
格式化为 `YYYY-MM-dd`。`sp` 参数为分隔符，默认 `'-'`。

**humanDate.datetime(date)**
格式化为 `YYYY-MM-dd HH:mm:ss`。

**humanDate.deltaTiny(ms) / humanDate.deltaTiny(from, to)**
将时间差 (ms) 格式化为最粗粒度的单位字符串，如 `'1d'`、`'3h'`。当 delta≤0 时返回 `'0s'`。最大单位为天。

**humanDate.delta(ms) / humanDate.delta(from, to)**
将时间差格式化为包含所有单位的字符串，如 `'1d10m42s'`。当 delta<1min 时才显示毫秒。当 delta≤0 时返回 `'0s'`。

**humanDate.setLocaleFormatter(formatter)**
设置各时间单位的格式化函数 (ms/s/m/h/d)，用于本地化输出。参数为 `Partial<IFormatters>`。

<!-- File: date/unix.md -->

##### getTimeStamp

将 `Date` 对象转换为 Unix 时间戳 (秒)。

**类型:** `(date: Date) => number`

---

##### fromTimeStamp

将 Unix 时间戳 (秒) 转换为 `Date` 对象。

**类型:** `(timestamp: number) => Date`

<!-- File: debugging/inspect.md -->

##### inspectSymbol

Node.js 自定义 inspect 方法的 Symbol，值为 `Symbol.for('nodejs.util.inspect.custom')`。

**类型:** `symbol`

---

##### defineInspectMethod

为对象定义自定义 inspect 方法 (私有、不可枚举)。

**类型:** `<T>(obj: T, method: (this: T, depth: number, context: any, inspect: Function) => string) => T`

**参数:**
- `obj` — 目标对象
- `method` — inspect 回调函数

**返回:** 同一对象 (`obj`)

---

##### tryInspect

尝试将对象转换为可读字符串。优先使用 Node.js 的 `util.inspect`；若不可用，则依次尝试 `[inspectSymbol]`、`.inspect()`、`Symbol.toStringTag`、`.toJSON()`；最后回退到构造函数名。

**类型:** `(object: any) => string`

<!-- File: debugging/object-with-name.md -->

##### objectName

获取对象的 `displayName` 或 `name` 属性。

**类型:** `<T>(func: NonNullable<T>) => string | undefined`

---

##### nameObject

为对象设置 `displayName` (或 `name`)，同时设置 `Symbol.toStringTag`。

**类型:** `<T extends {}>(name: string, object: T) => T & NamedObject`

**参数:**
- `name` — 要设置的名称
- `object` — 目标对象

**返回:** 同一对象 (类型包含 `NamedObject`)

---

##### assertObjectHasName

断言对象必须有 `displayName` 或 `name` 属性，否则抛出 `TypeError`。

**类型:** `<T>(func: NonNullable<T>) => asserts func is T & NamedObject`

---

##### functionName

与 `objectName` 相同，但如果没有名称则返回 `'<anonymous>'`。

**类型:** `(func: Function) => string`

<!-- File: debugging/serializable.md -->

##### isScalar

判断值是否为标量类型 (包括 `bigint`、`number`、`boolean`、`string`、`symbol`、`undefined`、`null`、`Date`、`RegExp`、`Function` 及其装箱对象)。

**类型:** `(value: any) => value is ScalarTypes`

---

##### SerializableKind

序列化状态枚举:

| 值 | 含义 |
|---|---|
| `Invalid` (0) | 不可序列化 |
| `Primitive` (1) | 基本类型，可直接序列化 |
| `Manual` (2) | 有 `toJSON` 或 `Symbol.toPrimitive`，手动序列化 |
| `Other` (3) | 普通对象，需递归处理 |

---

##### isSerializable

检查值的序列化状态。`Map`、`Set`、`RegExp`、`Promise`、浏览器 `EventTarget` 等返回 `Invalid`；`NaN`/`Infinity` 返回 `Invalid`。

**类型:** `(value: any) => SerializableKind`

---

##### getTypeOf

返回值的类型字符串，比 `typeof` 更精细 (区分 `null`、`Promise`、`Error`、DOM 元素等)。

**类型:** `(value: any) => string`

---

##### assertSerializable

断言对象可序列化，若发现不可序列化的值则打印路径并抛出 `TypeError`。

**类型:** `(value: any) => void`

<!-- File: error/cause.md -->

##### getRootCause

递归沿 `cause` 链向下，返回最终根因错误。

**类型:** `(e: Error) => Error`

---

##### getCauseStack

返回从 `e` 开始的完整 cause 链数组，顺序为从外到内。

**类型:** `(e: Error) => Error[]`

<!-- File: error/convert-unknown.md -->

##### convertCaughtError

将 `catch` 捕获的任意值转换为 `Error` 对象。

**类型:** `(e: unknown) => Error`

若捕获到 `Exit` 错误，会直接重新抛出 (不应被包装)。若捕获到非 `Error` 值，会打印警告并包装为新的 `Error`。

<!-- File: error/get-frame.md -->

##### getErrorFrame

从 `Error.stack` 中取出第 N 帧的字符串。

**类型:** `(e: IWithStack, frame: number, downIfEmpty?: boolean) => string`

**参数:**
- `e` — 含有 `stack` 属性的对象
- `frame` — 帧索引 (0-based，跳过第一行消息行)
- `downIfEmpty` — 若指定帧为空时，向下查找最近非空帧，默认 `false`

**返回:** 找到的帧字符串；若超出范围且未开启 `downIfEmpty` 则返回 `''`。

<!-- File: error/pretty.nodejs.md -->

##### setErrorLogRoot

设置错误堆栈格式化时使用的根目录，用于将绝对路径转换为相对路径。在 VSCode Shell Integration 环境中会同时发送 `Cwd` 序列。

**类型:** `(root: string) => void`

---

##### prettyPrintError

在控制台以格式化方式打印错误对象 (含分隔线、cause 链)。仅在 Node.js 环境有完整效果。

设置环境变量 `DISABLE_PRETTY_ERROR=yes` 可禁用格式化，`PRETTY_ERROR_LOCATION` 可同时打印调用位置。

**类型:** `<ErrorType>(type: string, e: ErrorType) => void`

---

##### prettyFormatStack

将一组堆栈行字符串格式化为带颜色的可读数组。

**类型:** `(stackLines: readonly string[]) => string[]`

---

##### prettyFormatError

格式化错误对象为字符串。

**类型:** `<ErrorType>(e: ErrorType, withMessage?: boolean) => string`

**参数:**
- `e` — 错误对象
- `withMessage` — 是否包含错误消息行，默认 `true`

<!-- File: error/pretty.vscode.md -->

##### vscEscapeValue

对字符串进行 VSCode Shell Integration 协议的转义:
- 反斜杠 → `\\`
- 分号 → `\x3b`
- ASCII 码 <0x20 的控制字符 → `\xXX`

当字符串长度 ≥2000 时自动切换为快速模式 (仅处理反斜杠和分号)。

**类型:** `(input: string) => string`

<!-- File: error/stack-parser.v8.md -->

##### parseStackLine

解析一行 V8 格式的 stack trace 字符串，返回结构化的 `IStructreStackLine` 对象，包含 `func`、`location`、`eval` 等字段。

**类型:** `(line: string) => IStructreStackLine`

---

##### parseStackString

解析完整的 stack trace 字符串 (多行)，返回 `IStructreStackLine[]`。

**类型:** `(stack: string) => IStructreStackLine[]`

---

##### IStructreStackLine

解析后的堆栈行结构:

| 字段 | 类型 | 说明 |
|---|---|---|
| `invalid` | `boolean?` | 是否解析失败 |
| `special` | `boolean?` | 特殊标记行 |
| `toString()` | `() => string` | 原始行内容 |
| `func` | `{name, alias?}?` | 函数名信息 |
| `location` | `{path, schema, line, column, isAbsolute}?` | 文件位置 |
| `eval` | `{eval_func, eval_line, eval_column, funcs}?` | eval 来源 |

<!-- File: error/stack-trace.md -->

##### createStackTraceHolder

创建一个保存当前调用堆栈的对象，用于后续调试或错误追踪。仅在 V8 引擎下有完整效果；非 V8 环境会打印警告并回退到标准 `Error`。

**类型:** `(message: string, boundary?: any) => StackTraceHolder`

**参数:**
- `message` — 堆栈标记信息
- `boundary` — stack trace 的边界函数，该函数及其以上帧会从 stack 中排除

**返回:** `StackTraceHolder` 对象:

| 成员 | 说明 |
|---|---|
| `message` | 构造时传入的消息 |
| `stack` | 完整堆栈字符串 |
| `stackOnly` | 去掉第一行 (消息行) 的堆栈 |
| `name` | 可设置的名称 |

<!-- File: error-types/application.md -->

## 应用级错误类型

此模块是 `@idlebox/errors` 私有包的内容，通过 `@idlebox/common` 导出。

#### Exit

程序正常退出的错误信号。捕获到此错误时应直接重新抛出，不做其他处理。

```typescript
class Exit extends ErrorWithCode {
  constructor(code: number, opts?: IErrorOptions);
}
```

#### Quit

`Exit` 的子类，使用 `ExitCode.SUCCESS`（0）退出。

```typescript
class Quit extends Exit {
  constructor(opts?: IErrorOptions);
}
```

#### InterruptError

由 `SIGINT`（Ctrl+C）或 `SIGTERM` 信号引起的中断错误。

```typescript
class InterruptError extends ErrorWithCode {
  constructor(signal: Signals, opts?: IErrorOptions);
  readonly signal: Signals;
}
```

#### UsageError

由于错误的参数或配置导致的错误（非程序 bug），通常对应 `ExitCode.USAGE`。

```typescript
class UsageError extends ErrorWithCode {
  constructor(message: string, opts?: IErrorOptions);
}
```

<!-- File: error-types/dependency.md -->

##### DependencyError

依赖项错误，继承自 `ProgramError`。

**类型:** `class DependencyError extends ProgramError`

---

##### ChildProcessExitError

子进程意外退出错误，继承自 `DependencyError`。

**类型:** `class ChildProcessExitError extends DependencyError`

构造函数接收包含以下可选字段的配置对象:

| 字段 | 说明 |
|---|---|
| `pid` | 子进程 PID |
| `commandline` | 命令行参数 |
| `workingDirectory` | 工作目录 |
| `exitCode` | 退出码 |
| `signal` | 退出信号 |
| `process` | `ChildProcess` 实例 |

<!-- File: error-types/development.md -->

##### ProgramError

程序 bug 导致的异常的抽象基类，退出码为 `ExitCode.PROGRAM` (66)。

**类型:** `abstract class ProgramError extends ErrorWithCode`

---

##### NotImplementedError

功能未实现错误。

**类型:** `class NotImplementedError extends ProgramError`

---

##### SoftwareDefectError

软件缺陷错误，继承自 `ProgramError`。

**类型:** `class SoftwareDefectError extends ProgramError`

---

##### Assertion

提供静态断言方法的类。

**类型:** `class Assertion extends SoftwareDefectError`

**静态方法:**
- `Assertion.ok(value, message?, opts?)` — 断言 `value` 为真值，否则抛出 `SoftwareDefectError`

---

##### VariableTypeError

变量类型错误，继承自 `TypeErrorWithCode`。

**类型:** `class VariableTypeError extends TypeErrorWithCode`

构造函数: `constructor(object: any, opts?: { Expected?, variableName?, ...IErrorOptions })`

---

##### InvalidStateError

无效状态错误，继承自 `ProgramError`。

**类型:** `class InvalidStateError extends ProgramError`

<!-- File: error-types/nodejs.md -->

##### NodeException

Node.js `ErrnoException` 类型，附带泛型错误码 `T`。

**类型:** `type NodeException<T extends LinuxErrorCode | NodeErrorCode = any> = NodeJS.ErrnoException & { code: T }`

---

##### OpenSSLException

OpenSSL 错误接口，包含 `opensslErrorStack`、`function`、`library`、`reason` 等字段。

---

##### isModuleResolutionError

判断错误是否为模块解析失败 (`MODULE_NOT_FOUND` 或 `ERR_MODULE_NOT_FOUND`)。

**类型:** `(ex: unknown) => ex is NodeException<...>`

---

##### isNotExistsError

判断错误是否为文件不存在 (`ENOENT`)。

**类型:** `(e: unknown) => e is NodeException<LinuxErrorCode.ENOENT>`

---

##### isExistsError

判断错误是否为文件已存在 (`EEXIST`)。

---

##### isFileTypeError

判断错误是否为文件类型错误 (`EISDIR` 或 `ENOTDIR`，即对目录执行文件操作或反之)。

---

##### isNodeError

判断错误是否为 Node.js `ErrnoException` (有 `code` 字符串属性)。

**类型:** `(e: unknown) => e is NodeException`

<!-- File: error-types/nodejs.unhandled.md -->

##### ProxiedError

包装其他类型异常 (包括非 Error 对象) 的抽象代理错误类。`stack` 属性透明代理到 `cause.stack`。

**类型:** `abstract class ProxiedError extends Error`

---

##### UnhandledRejection

未处理的 Promise rejection 包装错误。

**类型:** `class UnhandledRejection extends ProxiedError`

构造函数: `constructor(reason: unknown, promise: Promise<unknown>)`

- `promise` — 发生未处理 rejection 的 Promise

---

##### UncaughtException

未捕获的异常包装错误。

**类型:** `class UncaughtException extends ProxiedError`

构造函数: `constructor(error: Error)`

<!-- File: error-types/tools.md -->

##### CanceledError

表示操作被主动取消时的错误。

**类型:** `class CanceledError extends ErrorWithCode implements IHumanReadable`

构造函数: `constructor(opts?: IErrorOptions)`

**静态方法:**
- `CanceledError.is(e)` — 判断是否为 `CanceledError`

---

##### TimeoutError

表示某种操作超时的错误。

**类型:** `class TimeoutError extends ErrorWithCode implements IHumanReadable`

构造函数: `constructor(ms: number, why?: string, opts?: IErrorOptions & { what?: string })`

- `ms` — 超时毫秒数
- `why` — 超时原因描述，默认 `'no response'`
- `opts.what` — 正在做什么操作 (出现在错误消息中)

**静态方法:**
- `TimeoutError.is(error)` — 判断是否为 `TimeoutError`

<!-- File: function/callback-list.async.md -->

##### AsyncCallbackList

与 `CallbackList` 类似，但异步逐一执行所有回调。某个回调返回 `true` 时停止。

**类型:** `class AsyncCallbackList<Argument extends unknown[]>`

成员列表:

| 成员 | 类型 | 说明 |
|---|---|---|
| `add(item)` | `(cb) => number` | 添加回调，返回列表长度 |
| `remove(item)` | `(cb) => cb \| null` | 移除回调 |
| `run(...args)` | `async (...args) => boolean` | 按序异步执行所有回调，某个返回 `true` 时停止 |
| `reset()` | `() => void` | 清空列表 |
| `count()` | `() => number` | 返回列表长度 |

<!-- File: function/callback-list.delay.md -->

##### MemorizedOnceCallbackList

记忆最后一次 `run()` 的参数。第一次调用 `run()` 后，后续所有通过 `add()` 注册的回调会立即被调用并传入记忆的参数。

**类型:** `class MemorizedOnceCallbackList<Argument extends unknown[]>`

成员列表:

| 成员 | 类型 | 说明 |
|---|---|---|
| `add(item)` | `(cb) => void` | 添加回调；若已 run，立即执行 |
| `run(...args)` | `(...args) => void` | 执行所有已注册回调并记忆参数 |
| `count()` | `() => number` | 返回列表长度 |

<!-- File: function/callback-list.md -->

##### CallbackList

管理一组同步回调函数的列表。在回调执行期间不允许添加、删除或重置。

**类型:** `class CallbackList<Argument extends unknown[]>`

构造函数:
- `constructor(initial?: readonly MyCallback<Argument>[])`

成员列表:

| 成员 | 类型 | 说明 |
|---|---|---|
| `add(item, name?)` | `(cb, name?) => number` | 添加回调，返回列表长度 |
| `remove(item)` | `(cb) => cb \| null` | 移除回调，返回被移除项或 null |
| `run(...args)` | `(...args) => boolean` | 执行所有回调；某个回调返回 `false` 时停止并返回 `false` |
| `reset()` | `() => void` | 清空列表 |
| `count()` | `() => number` | 返回列表长度 |

<!-- File: function/noop.md -->

##### noop

空函数，无任何操作。可用于需要传入回调但不需要任何行为的场景。

**类型:** `() => void`

<!-- File: generate.devel.md -->

此文件为开发辅助脚本，用于触发 `@build-script/autoindex` 自动生成 index 文件。不导出任何公开符号。

<!-- File: iterate/merge-iterable.md -->

##### mergeIterables

将多个可迭代对象顺序合并为一个生成器 (先遍历第一个，再第二个，以此类推)。

**类型:** `<T>(...iterables: Iterable<T>[]) => Generator<T>`

---

##### joinAsyncIterables

与 `mergeIterables` 相同，但支持异步可迭代对象，返回 `AsyncGenerator`。

**类型:** `<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) => AsyncGenerator<T>`

---

##### interleaveIterables

将多个可迭代对象交错合并 (轮流从每个迭代器取一个元素)。

**类型:** `<T>(...iterables: Iterable<T>[]) => Generator<T>`

---

##### interleaveAsyncIterables

与 `interleaveIterables` 相同，但支持异步可迭代对象。

**类型:** `<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) => AsyncGenerator<T>`

<!-- File: legacy/rename.md -->

已废弃的导出别名

<!-- toDisposable is deprecated
Type: typeof functionToDisposable -->
<!-- AsyncDisposable is deprecated
Type: typeof EnhancedAsyncDisposable -->
<!-- Disposable is deprecated
Type: typeof EnhancedDisposable -->
<!-- convertCatchedError is deprecated
Type: typeof convertCaughtError -->

<!-- File: lifecycle/cancellation/driver.browser.md -->

此文件为 `@internal` 实现，不导出公开符号。`CancellationDriverBrowser` 是基于浏览器 `AbortController` 的取消令牌驱动实现，供 `CancellationTokenSource` 内部使用。

<!-- File: lifecycle/cancellation/driver.common.md -->

此文件为 `@internal` 实现，不导出公开符号。`CancellationDriverCommon` 是基于 `Emitter` 的通用取消令牌驱动实现，供 `CancellationTokenSource` 内部使用。

<!-- File: lifecycle/cancellation/source.md -->

##### CancellationToken

取消令牌接口，只读。

| 成员 | 说明 |
|---|---|
| `isCancellationRequested` | 是否已请求取消 |
| `onCancellationRequested(callback)` | 注册取消回调，返回 `IDisposable` |

---

##### CancellationTokenSource

取消令牌的控制端。继承自 `DisposableOnce`。创建后通过 `.token` 属性分发给消费者，调用 `.cancel()` 触发取消，`.dispose()` 自动取消并清理。

**类型:** `class CancellationTokenSource extends DisposableOnce`

成员:

| 成员 | 说明 |
|---|---|
| `token` | 只读的 `CancellationToken` |
| `cancel()` | 触发取消 |
| `dispose()` | 取消并释放资源 |

**示例:**
```typescript
const source = new CancellationTokenSource();
doWork(source.token);
// 需要取消时:
source.cancel();
```

<!-- File: lifecycle/dispose/async-disposable.md -->

##### EnhancedAsyncDisposable

异步资源容器类 (完整版)，可继承或直接用作 `DisposableStack`。

dispose 时按注册顺序逆序释放所有资源。所有资源释放完毕后再抛出异常 (只抛最后一个)。若 `onDisposeError` 有监听器则不抛出 (除非监听器重新抛出)。

实现了 `[Symbol.asyncDispose]`，兼容 `await using`。

继承自 `AbstractEnhancedDisposable`，参见该类的公共成员。

---

##### UnorderedAsyncDisposable

与 `EnhancedAsyncDisposable` 相同，但并发释放所有资源并忽略任何错误。

继承自 `EnhancedAsyncDisposable`。

<!-- File: lifecycle/dispose/bridges/function.md -->

##### functionToDisposable

将一个 "释放函数" 包装为 `IDisposable` 或 `IAsyncDisposable` 对象。

**类型:** `<RT>(fn: () => RT) => RT extends Promise<any> ? IAsyncDisposable : IDisposable`

**参数:**
- `fn` — dispose 时调用的函数，若返回 `Promise` 则包装为 `IAsyncDisposable`

---

##### disposerFunction

将 `IDisposable`/`IAsyncDisposable` 对象转换为普通函数，便于在 React `useEffect` 等场景使用。

**类型:** `<T extends IDisposable | IAsyncDisposable>(obj: T) => T extends IAsyncDisposable ? () => Promise<void> : () => void`

**示例:**
```typescript
useEffect(() => {
  const d = new MyResource();
  return disposerFunction(d); // () => void
}, []);
```

<!-- File: lifecycle/dispose/bridges/native.md -->

##### fromNativeDisposable

将原生 `Disposable` / `AsyncDisposable` 对象 (使用 `Symbol.dispose` / `Symbol.asyncDispose`) 转换为本包的 `IDisposable` / `IAsyncDisposable` 格式 (添加 `.dispose()` 方法)。

**类型:** `<T extends Disposable | AsyncDisposable>(disposable: T) => T & IDisposable & IAsyncDisposable`

注意: 返回的是同一对象，原地修改。

---

##### toNativeDisposableAsync

将 `IAsyncDisposable` 转换为原生 `AsyncDisposable`，添加 `[Symbol.asyncDispose]`。

**类型:** `(disposable: IAsyncDisposable) => AsyncDisposable`

---

##### toNativeDisposableSync

将 `IDisposable` 转换为原生 `Disposable`，添加 `[Symbol.dispose]`。

**类型:** `(disposable: IDisposable) => Disposable`

<!-- File: lifecycle/dispose/bridges/streams.md -->

##### closableToDisposable

将具有 `close()` 方法的对象转换为 `IAsyncDisposable`。`close()` 可以接受回调或返回 `Promise`。

**类型:** `<T extends ClosableAsync>(closable: T) => IAsyncDisposable`

---

##### endableToDisposable

将具有 `end()` 方法的对象转换为 `IAsyncDisposable`。`end()` 可以接受回调或返回 `Promise`。

**类型:** `<T extends EndableAsync>(endable: T) => IAsyncDisposable`

<!-- File: lifecycle/dispose/debug.md -->

此文件为 `@internal` 实现，不导出公开符号。提供 dispose 调试工具，包括 `DEBUG=dispose` 日志输出和父子关系追踪（`rememberParent` / `forgetParent`）。

<!-- File: lifecycle/dispose/disposableEvent.md -->

##### addDisposableEventListener

为事件发射器添加事件监听器，返回可取消的 `IDisposable`。

**类型:** `(target: IEventEmitterObject | IShorthandEmitterObject, type: string, handler: Function) => IDisposable`

支持两种接口的 target:
- `IEventEmitterObject`: 有 `addListener` / `removeListener`
- `IShorthandEmitterObject`: 有 `on` / `off`

<!-- File: lifecycle/dispose/disposable.md -->

## 增强型 Disposable 基础设施

提供带生命周期管理、事件通知、重复 dispose 保护的可销毁对象基类。

#### DuplicateDisposeAction

控制重复调用 `dispose()` 时的行为。

```typescript
enum DuplicateDisposeAction {
  Disable = 0,  // 抛出错误
  Warning = 1,  // 打印警告（默认）
  Allow = 2,    // 允许重复调用，直接返回
}
```

#### IDisposable

同步可销毁对象的接口。

```typescript
interface IDisposable {
  dispose(): void;
}
```

#### IAsyncDisposable

异步可销毁对象的接口，`dispose()` 可返回 Promise。

```typescript
interface IAsyncDisposable {
  dispose(): void | Promise<void>;
}
```

#### IDisposableEvents

具有生命周期事件的 Disposable 接口。

```typescript
interface IDisposableEvents {
  readonly onBeforeDispose: EventRegister<void>;
  readonly onDisposeError: EventRegister<Error>;
  readonly onPostDispose: EventRegister<void>;
  readonly disposed: boolean;
}
```

#### AbstractEnhancedDisposable

增强型 Disposable 抽象基类，同时实现 `IDisposableEvents`。

支持同步和异步两种模式（由泛型参数 `Async extends boolean` 控制）。

##### constructor

```typescript
new AbstractEnhancedDisposable<Async>(displayName?: string);
```

`displayName` 用于调试日志，不传时自动从类名推断。

| 成员 | 类型 | 说明 |
|------|------|------|
| `displayName` | `string \| undefined` | 调试用名称 |
| `disposed` | `boolean` | 是否已完成 dispose |
| `disposing` | `boolean` | 是否正在 dispose 中（已开始但未完成）|
| `onBeforeDispose` | `EventRegister<void>` | dispose 开始前触发 |
| `onDisposeError` | `EventRegister<Error>` | dispose 抛出异常时触发 |
| `onPostDispose` | `EventRegister<void>` | dispose 完成后触发 |
| `dispose()` | `void \| Promise<void>` | 销毁此对象及其注册的子 disposable |
| `assertNotDisposed()` | `void` | 断言未被 dispose，否则抛出 `DuplicateDisposedError` |
| `_register(d)` | `T` | 注册子 disposable，dispose 时自动销毁 |
| `_unregister(d)` | `boolean` | 取消注册子 disposable |
| `duplicateDispose` | `DuplicateDisposeAction` | (protected) 重复 dispose 行为，默认 `Warning` |
| `_dispose(disposables)` | `void \| Promise<void>` | (protected abstract) 子类实现的销毁逻辑 |

**示例**
```typescript
class MyService extends EnhancedDisposable {
  private readonly timer = this._register(new SomeDisposable());
}
const svc = new MyService();
svc.onBeforeDispose(() => console.log('即将销毁'));
svc.dispose();
```

#### dumpDisposableStack

将 Disposable 树结构打印到 `console.error`，用于调试。

```typescript
function dumpDisposableStack(disposable: AbstractEnhancedDisposable<any>): void;
```

<!-- File: lifecycle/dispose/disposedError.md -->

##### DuplicateDisposedError

当对象被重复 dispose 时抛出的错误，继承自 `DisposedError`。

**类型:** `class DuplicateDisposedError extends DisposedError`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `object` | `any` | 被重复 dispose 的对象 |
| `consoleWarning()` | `() => void` | 在控制台打印彩色警告信息 |
| `previous` | `StackTraceHolder` | 第一次 dispose 时的 stack |

<!-- File: lifecycle/dispose/sync-disposable.md -->

##### DisposableOnce

简单版手动 disposable 抽象类，防止重复 dispose。

**类型:** `abstract class DisposableOnce implements IDisposable`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `disposed` | `boolean` | 是否已 dispose |
| `dispose()` | `() => void` | 调用一次；重复调用仅打印警告 |

需要继承并实现 `_dispose()` 方法。

---

##### EnhancedDisposable

完整版同步 Disposable 类，继承自 `AbstractEnhancedDisposable<false>`。可继承或直接用作资源容器。

实现了 `[Symbol.dispose]`，兼容 `using` 语法。参见 `AbstractEnhancedDisposable` 的成员文档。

<!-- File: lifecycle/event/event.md -->

##### Emitter

事件发射器，实现 `IEventEmitter<T>` 接口。

**类型:** `class Emitter<T = unknown> implements IEventEmitter<T>`

构造函数: `constructor(displayName?: string, onErrorDefault?: FireErrorAction)`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `displayName` | `string` | 调试名称 |
| `register` | `EventRegister<T>` | handle 的别名，已 bind |
| `event` | `EventRegister<T>` | handle 的别名 |
| `handle(callback)` | `(cb) => IDisposable` | 添加监听器，已 bind |
| `once(callback)` | `(cb) => IDisposable` | 添加一次性监听器 |
| `wait()` | `() => Promise<T>` | 等待下次触发的 Promise |
| `fire(data, error?)` | `(data, error?) => void` | 触发事件 |
| `listenerCount()` | `() => number` | 当前监听器数量 |
| `disposed` | `boolean` | 是否已 dispose |
| `dispose()` | `() => void` | 释放所有监听器 |

`fire` 的 `error` 参数 (`Emitter.EAction`):
- `Throw` (默认) — 遇错立即抛出
- `Delay` — 全部执行后抛出 `AggregateError`
- `Ignore` — 忽略所有错误
- `PrintIgnore` — 打印错误但继续执行

<!-- File: lifecycle/event/memorized.md -->

##### MemorizedEmitter

记忆上次 `fire()` 的数据，每次新监听器注册时立即以记忆的数据调用一次。继承自 `Emitter<T>`。

注意: 不支持 `once()` 方法 (会抛出错误)。

**类型:** `class MemorizedEmitter<T> extends Emitter<T>`

额外成员:

| 成员 | 说明 |
|---|---|
| `forget()` | 清除记忆的数据 |

<!-- File: lifecycle/event/type.md -->

##### EventHandler

事件回调函数类型: `(data: T) => void`

---

##### EventRegister

事件注册函数接口 (所有方法均已 bind):

```typescript
interface EventRegister<T> {
  (callback: EventHandler<T>): IDisposable;
  once(callback: EventHandler<T>): IDisposable;
  wait(): IDisposable;
  readonly disposed: boolean;
}
```

---

##### IEventEmitter

完整的事件发射器接口，包含 `fire`、`handle`、`once`、`wait`、`listenerCount`、`disposed` 等成员。

---

##### EventEmitterMap

将类型映射转换为 Emitter map 类型: `{ [K in keyof T]: Emitter<T[K]> }`

<!-- File: lifecycle/global/global-lifecycle.md -->

## 全局生命周期管理

提供应用级全局 Disposable 容器，统一管理需要在应用退出时销毁的资源。

#### registerGlobalLifecycle

将对象注册到全局 Disposable 容器，应用退出时（调用 `disposeGlobal`）自动销毁。

```typescript
function registerGlobalLifecycle(object: IDisposable | IAsyncDisposable): void;
function registerGlobalLifecycle(
  object: (IDisposable | IAsyncDisposable) & IDisposableEvents,
  autoDereference: true
): void;
```

**参数说明**
当 `autoDereference` 为 `true` 时，对象自身 dispose 后会自动从全局容器中移除，需要对象同时实现 `IDisposableEvents`。

#### disposeGlobal

销毁全局 Disposable 容器中的所有注册对象。

```typescript
function disposeGlobal(): Promise<void>;
```

**特殊说明**
重复调用会抛出错误。如需安全调用请使用 `ensureDisposeGlobal`。

#### ensureDisposeGlobal

与 `disposeGlobal` 相同，但重复调用不抛出错误。

```typescript
function ensureDisposeGlobal(): Promise<void>;
```

<!-- File: log/logger.md -->

##### WrappedConsole

带标题前缀的 Console 抽象基类。所有标准 Console 方法均已重写，输出时自动添加 `[title]` 前缀。

**类型:** `abstract class WrappedConsole`

构造函数: `constructor(title: string, options?: WrappedConsoleOptions)`

- `options.parent` — 代理的原始 console 对象，默认 `console`
- `options.bind` — 是否 bind 原始方法，默认 `false`

支持 `info`、`log`、`debug`、`error`、`warn`、`trace`、`assert`、`time`、`timeEnd` 等标准方法。

继承此类需实现 `processColorLabel(args, messageLoc, level, prefix)` 方法以控制颜色/前缀格式。

---

##### ColorKind

颜色模式枚举:

| 值 | 说明 |
|---|---|
| `DISABLE` (0) | 禁用颜色 |
| `TERMINAL` (1) | 终端 ANSI 颜色 |
| `WEB` (2) | 浏览器 console 颜色 |
| `DETECT` (3) | 自动检测 |

<!-- File: map-and-set/custom-set.md -->

##### CustomSet

使用自定义比较函数的 Set 抽象基类。

**类型:** `abstract class CustomSet<Type>`

需要继承并实现 `compare(item1, item2): number` 方法。

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `has(item)` | `(item) => boolean` | 是否包含 |
| `add(item)` | `(item) => boolean` | 添加，返回是否新增 |
| `addAll(items)` | `(items) => Type[]` | 批量添加，返回实际新增的元素 |
| `delete(item)` | `(item) => boolean` | 删除，返回是否存在 |
| `deleteAll(items)` | `(items) => Type[]` | 批量删除，返回实际删除的元素 |
| `clear()` | `() => void` | 清空 |
| `length` | `number` | 元素数量 |
| `toArray()` | `() => Type[]` | 转换为数组 |

<!-- File: map-and-set/object-map.md -->

##### convertToMap

将普通对象转换为 `Map`。

**类型:** `<K extends string, V>(object: Record<K, V>) => Map<K, V>`

<!-- File: map-and-set/required-map.md -->

##### RequiredMap

继承自 `Map`，`get()` 在键不存在时抛出错误。

**类型:** `class RequiredMap<K, V> extends Map<K, V>`

额外成员:

| 成员 | 说明 |
|---|---|
| `get(id)` | 键不存在时抛出错误 |
| `get(id, def)` | 键不存在时返回 `def` (不插入) |
| `entry(id, init)` | 键不存在时调用 `init(id)` 并保存，返回值 |

---

##### InstanceMap

继承自 `Map`，`get()` 在键不存在时自动创建实例。

**类型:** `abstract class InstanceMap<K, V> extends Map<K, V>`

需要继承并实现 `instance(key: K): V` 方法，该方法在键不存在时被调用来创建值。

<!-- File: misc/assertNotNull.md -->

##### assertNotNull

断言值非 `null`、非 `undefined`、非 `NaN`，否则抛出错误。

**类型:** `<T>(val: T) => NonNullable<T>`

**返回:** 原值 (类型变窄为 `NonNullable<T>`)

<!-- File: misc/package.json.md -->

package.json 文件的类型定义和解析工具

##### IPackageJson

`interface` - 完整的 package.json 类型定义, 包含所有标准字段及一些自定义扩展字段

常用字段: `name`, `version`, `main`, `module`, `exports`, `dependencies`, `devDependencies` 等

自定义扩展字段:
- `decoupledDependencies`: 构建顺序解析时需要移除的依赖列表
- `decoupledDependents`: 将当前包加入指定包的 `decoupledDependencies` 列表
- `additionalDependencies`: 构建顺序解析时额外添加的 `devDependencies`
- `llms` / `llmsFull`: LLM 相关描述字段

##### IPackageJsonNpmDist

`interface` - npm registry 返回的 `dist` 字段类型, 包含 `integrity`, `shasum`, `tarball`, `fileCount`, `unpackedSize`, `signatures`, `size`

##### IExportCondition

`interface` - package.json `exports` 字段中的条件导出对象

支持的条件: `node`, `node-addons`, `browser`, `require`, `import`, `types`, `default` 及自定义平台

##### IExportMap

`interface` - 路径映射形式的 exports, key 为以 `.` 开头的导出路径

##### IFullExportsField

`interface` - 标准化后的完整 exports 字段, 所有路径均映射到 `IExportCondition`

##### IExportsField

`type` = `string | IExportCondition | IExportMap`

exports 字段的所有可能类型

##### IImportsField

`type` = `IExportCondition | IExportMap`

imports 字段的所有可能类型

##### parseExportsField

解析 package.json 的 `exports` 字段为标准化的 `IFullExportsField` 格式

- `exports`: `IExportsField` - 原始 exports 字段值
- 返回: `IFullExportsField` - 标准化后的路径到条件导出的映射

```typescript
// 字符串形式
parseExportsField('./index.js')
// => { '.': { default: './index.js' } }

// 条件导出形式
parseExportsField({ import: './index.mjs', require: './index.cjs' })
// => { '.': { import: './index.mjs', require: './index.cjs' } }

// 路径映射形式
parseExportsField({ '.': './index.js', './utils': './utils.js' })
// => { '.': { default: './index.js' }, './utils': { default: './utils.js' } }
```

##### resolveExportPath

根据给定的条件列表解析导出路径

- `exportField`: `string | IExportCondition` - 单个导出条件对象或字符串
- `condition`: `readonly string[]` - 条件优先级列表(如 `['import', 'default']`)
- 返回: `string | undefined` - 解析后的文件路径, 无匹配则返回 `undefined`

```typescript
resolveExportPath({ import: './index.mjs', require: './index.cjs' }, ['import', 'default'])
// => './index.mjs'
```

<!-- File: nodejs-error-code.generated.md -->

## NodeErrorCode / OpenSSLErrorCode

从 [Node.js 官方错误文档](https://nodejs.org/api/errors.html) 自动提取生成的枚举，包含所有 Node.js 和 OpenSSL 错误代码字符串常量。

此模块是 `@idlebox/node-error-codes` 私有包的内容，作为 `@idlebox/common` 的一部分导出。

#### NodeErrorCode

包含 Node.js 所有内置错误代码的枚举，例如：

```typescript
enum NodeErrorCode {
  ABORT_ERR = 'ABORT_ERR',
  ERR_ACCESS_DENIED = 'ERR_ACCESS_DENIED',
  ERR_INVALID_ARG_TYPE = 'ERR_INVALID_ARG_TYPE',
  // ... 共100+个错误代码
}
```

每个枚举成员的 JSDoc 注释来自 Node.js 官方文档，包含该错误的详细说明。已废弃的遗留错误代码标记了 `@deprecated`。

#### OpenSSLErrorCode

包含 OpenSSL 错误代码的枚举，格式同 `NodeErrorCode`。

<!-- File: nodejs-error-code.generator.md -->

此为代码生成器，不导出面向用户的公开 API。从 [Node.js 错误 API 文档](https://nodejs.org/api/errors.json) 下载并解析错误代码列表，生成 `NodeErrorCode` 和 `OpenSSLErrorCode` 枚举文件。

<!-- File: object/definePublicConstant.md -->

##### definePublicConstant

以 `configurable: false, enumerable: true, writable: false` 定义不可修改的公开属性。

**类型:** `(object: any, propertyKey: string | symbol, value: any) => void`

---

##### definePrivateConstant

以 `configurable: false, enumerable: false, writable: false` 定义不可修改的私有 (不可枚举) 属性。

**类型:** `(object: any, propertyKey: string | symbol, value: any) => void`

<!-- File: object/initOnRead.md -->

##### initOnRead

在目标对象上定义懒初始化属性 (prototype 级别)。第一次访问时调用 `init()` 并将结果缓存，后续访问直接返回缓存值。

**类型:** `<O, T extends keyof O>(target: any, propertyKey: T, init: (this: O) => O[T]) => void`

**参数:**
- `target` — 目标对象 (通常是 prototype)
- `propertyKey` — 属性名
- `init` — 初始化函数，`this` 指向访问该属性的实例

若属性已存在则跳过。

<!-- File: object/objectPath.md -->

##### objectPath

通过 `.` 分隔的路径字符串获取对象的深层属性值。遇到 falsy 中间值时停止并返回该值。

**类型:** `(obj: object, path: string) => any`

---

##### ObjectPath

基于路径数组对对象进行读写操作的工具类。

**类型:** `class ObjectPath`

构造函数: `constructor(object: any)`

成员:

| 成员 | 说明 |
|---|---|
| `object` | 操作的目标对象 |
| `get(path)` | 按路径读值，中间路径不存在时返回 `undefined` |
| `exists(path)` | 判断路径末尾的 key 是否存在 |
| `set(path, value)` | 设置值，若 `value` 为 `undefined` 则删除并清理空对象 |

<!-- File: object/objectPath.test.md -->

此为测试文件，不导出公开 API。用于验证 `ObjectPath` 类的 `get` 和 `set` 行为。

<!-- File: object/objectSame.md -->

##### isObjectSame

比较两个对象的键和值是否完全相同 (浅比较，值使用 `===`)。

**类型:** `(a: any, b: any) => boolean`

---

##### isObjectSameRecursive

深度比较两个对象是否完全相同，递归处理嵌套对象和数组。

**类型:** `(a: any, b: any) => boolean`

<!-- File: path/isAbsolute.md -->

##### isAbsolute

判断路径是否为绝对路径。支持 Unix 路径 (`/xxx`)、Windows 路径 (`c:\`)、UNC 路径和 URL (`http://`)。

**类型:** `(path: string) => boolean`

<!-- File: path/normalizePath.md -->

##### PathKind

路径类型枚举:

| 值 | 说明 |
|---|---|
| `url` (0) | URL (含 schema) |
| `unc` (1) | UNC 路径 (`\\?\UNC\`) |
| `win` (2) | Windows 路径 (`C:\`) |
| `cifs` (3) | CIFS/Samba 路径 (`\\server\`) |
| `unix` (4) | Unix 绝对路径 (`/`) |
| `relative` (5) | 相对路径 |

---

##### analyzePath

解析路径字符串，返回 `IPathInfo` 对象，包含 `kind`、`prefix`、`path` (规范化后的路径段，使用 `/`) 等字段。同时处理 `..` 和 `.`。

**类型:** `(p: string) => IPathInfo`

---

##### normalizePath

将路径规范化: 替换 `\\` 为 `/`、删除末尾 `/`、处理 `..` 和 `.`。

**类型:** `(p: string) => string`

---

##### relativePath

计算从 `from` 到 `to` 的相对路径。两个路径必须是相同类型 (`PathKind`)。

**类型:** `(from: string, to: string) => string`

<!-- File: path/pathArray.md -->

##### PathArrayPosix

处理 `PATH` 环境变量格式字符串的工具类，始终使用 `/`，分隔符为 `:`。

**类型:** `class PathArrayPosix`

---

##### PathArrayWindows

Windows 版 PATH 数组工具类，大小写不敏感，分隔符为 `;`。

**类型:** `class PathArrayWindows`

---

##### PathArray

根据当前平台自动选择 `PathArrayPosix` 或 `PathArrayWindows`。

两个类共有成员:

| 成员 | 说明 |
|---|---|
| `add(value, first?, force?)` | 添加路径，`first=true` 表示插入到开头，`force=true` 强制重新添加 |
| `delete(value)` | 删除路径 |
| `has(value)` | 是否包含 |
| `toString()` | 转换为 PATH 字符串 |
| `toArray()` | 转换为数组 |
| `joinpath(part)` | 为每个元素拼接后缀路径 |
| `clear()` | 清空 |
| `size` | 元素数量 |

<!-- File: path/pathCalc.md -->

##### isPathContains

检查两个路径是否存在父子关系。

**类型:** `(parent: string, child: string, equalsOk?: boolean) => boolean`

**参数:**
- `parent` — 父目录路径
- `child` — 子路径
- `equalsOk` — 路径相等是否视为父子关系，默认 `false`

**返回:** 若 `parent` 是 `child` 的父目录则返回 `true`。

<!-- File: platform/compile.md -->

##### isProductionMode

是否为生产模式。读取 `import.meta.env?.MODE === 'production'`，需要编译工具支持 define replacement (如 Vite 无需额外配置)。

**类型:** `boolean`

---

##### isBuildMode

是否为构建模式。读取 `import.meta.env?.PROD`。

**类型:** `boolean`

<!-- File: platform/globalObject.md -->

##### globalObject

全局对象引用: 优先使用 `globalThis`，回退到 `window` (浏览器) 或 `global` (Node.js)。

**类型:** `any`

---

##### ensureGlobalObject

获取或创建全局单例 (保存于 `globalThis[Symbol.for(symbol)]`)。若已存在则直接返回。

**类型:** `<T>(symbol: string, constructor: () => T) => T`

---

##### ensureGlobalObjectSingleton

与 `ensureGlobalObject` 类似，但若已存在则抛出错误 (强制单例语义)。

**类型:** `<T>(symbol: string, constructor: () => T) => T`

<!-- File: platform/globalSingleton.md -->

##### globalSingletonStrong

从全局注册表获取或创建强引用单例。若提供 `constructor` 且键不存在，则创建并保存。

**类型:** `<T>(symbol: symbol | string, constructor?: () => T) => T | undefined`

若不传 `constructor` 且键不存在，返回 `undefined`；若 constructor 返回 `undefined` 则抛出 `TypeError`。

---

##### globalSingleton

与 `globalSingletonStrong` 类似，但以 `WeakRef` 保存，允许被 GC 回收。

**类型:** `<T>(symbol: symbol | string, constructor?: () => T) => T | undefined`

---

##### globalSingletonDelete

从全局注册表中删除指定键。

**类型:** `(symbol: symbol | string) => void`

<!-- File: platform/globalSymbol.md -->

##### createSymbol

创建或获取指定分类下的命名 Symbol，类似于 `Symbol.for` 但有分类组织。

**类型:** `(category: string, name: string) => symbol`

---

##### deleteSymbol

从全局 Symbol 注册表中删除指定的 Symbol。

**类型:** `(category: string, name: string) => void`

<!-- File: platform/os.md -->

##### hasProcess / hasWindow / hasGlobal

运行环境检测布尔值:
- `hasProcess` — 是否有真实的 `process.pid` (Node.js)
- `hasWindow` — 是否在浏览器顶层 window
- `hasGlobal` — 是否在 Node.js global

##### isElectron / isElectronRenderer / isElectronMain / isElectronSandbox

Electron 环境检测布尔值。

##### isWindows / isMacintosh / isLinux / isNative / isNodeJs / isWeb / is64Bit / is32Bit

操作系统和平台检测布尔值。在 Node.js 下基于 `process.platform` 和 `process.arch` 检测，在浏览器下基于 `navigator.userAgent` 检测。

##### isV8

是否运行在 V8 引擎上 (支持 `Error.captureStackTrace` 或堆栈包含 ` at ` 格式)。

**类型:** `boolean`

##### sepList

当前平台的 PATH 分隔符: Windows 为 `;`，其他为 `:`。

**类型:** `string`

<!-- File: promise/await-iterator.md -->

##### awaitIterator

将 `Iterator` 转换为 `Promise`，resolve 时返回迭代器的最后一个值。

对每个 yield 值，若它是 `Promise` 则 await；若是可迭代对象则递归处理；否则直接保留。

**类型:** `<T>(generator: Iterator<T>) => Promise<T>`

<!-- File: promise/deferred-promise.md -->

##### DeferredPromise

可延迟 resolve/reject 的 Promise 容器，支持进度通知。

**类型:** `class DeferredPromise<T, PT = any>`

构造函数: `constructor()`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `promise` | `Promise<T> & IProgressHolder<T, PT>` | 内部 Promise，支持 `.progress(fn)` |
| `p` | `Promise<T> & IProgressHolder<T, PT>` | `promise` 的别名 |
| `working` | `boolean` | 是否未 settled |
| `settled` | `boolean` | 是否已 settled |
| `resolved` | `boolean` | 是否已 resolve |
| `rejected` | `boolean` | 是否已 reject |
| `complete(value)` | `(value: T) => void` | resolve |
| `error(err)` | `(err) => void` | reject |
| `cancel()` | `() => void` | 以 `CanceledError` reject |
| `notify(progress)` | `(pt: PT) => this` | 通知进度 |
| `timeout(ms)` | `(ms) => IDisposable` | 设置超时，超时后以 `TimeoutError` reject |
| `callback` | `(error?, data?) => void` | Node.js 风格回调 |

**静态方法:**
- `DeferredPromise.wrap(prev)` — 将普通 Promise 包装为 DeferredPromise

<!-- File: promise/is-promise.md -->

##### isPromiseLike

判断值是否为 `PromiseLike` (具有 `.then` 方法的对象)。

**类型:** `(object: unknown) => object is PromiseLike<unknown>`

<!-- File: promise/promise-bool.md -->

##### promiseBool

将 Promise 转换为返回布尔值的 Promise: resolve 时返回 `true`，reject 时丢弃错误并返回 `false`。

**类型:** `(p: Promise<any>) => Promise<boolean>`

<!-- File: promise/promise-list.md -->

##### PromiseCollection

管理一组以字符串 ID 索引的 DeferredPromise 集合。

**类型:** `class PromiseCollection`

成员:

| 成员 | 说明 |
|---|---|
| `create(id)` | 创建 Promise，返回其 `p`；若 id 已存在则抛错 |
| `has(id)` | 是否存在 |
| `done(id, data)` | resolve 指定 id 的 Promise 并删除 |
| `error(id, e)` | reject 指定 id 的 Promise 并删除 |
| `dispose()` | 以 `CanceledError` reject 所有待处理 Promise |
| `size()` | 返回待处理数量 |

<!-- File: promise/race-first.md -->

Promise 竞争工具: 返回第一个成功的结果

##### raceFirstSuccess

类似 `Promise.any`, 返回第一个成功 resolve 的 Promise 的值; 若全部失败则 reject 一个 `AggregateError`

- `promises`: `PromiseLike<T>[]` - 要竞争的 Promise 数组
- 返回: `Promise<T>` - 第一个成功的结果

```typescript
const result = await raceFirstSuccess([
  fetch('https://mirror1.example.com/data'),
  fetch('https://mirror2.example.com/data'),
]);
```

<!-- File: re-export.md -->

此文件将 `@idlebox/errors` 的所有导出重新导出到 `@idlebox/common`。包含的符号请参见 `common/base.md`、`codes/nodejs-re-export.md`、`error-types/application.md` 等各子文档。

<!-- File: reflection/classes/pointer.md -->

##### Pointer

创建一个透明 Proxy，所有操作代理到 `ref.reference` 所指向的对象上。当 `reference` 改变时，Proxy 会自动指向新的目标。

**类型:** `<T>(ref: Ref<T>) => T`

**参数:**
- `ref` — 包含 `reference` 属性的容器对象

**示例:**
```typescript
const ref = { reference: myService };
const proxy = Pointer(ref);
// 使用 proxy 时等同于使用 myService
ref.reference = newService; // proxy 自动切换目标
```

<!-- File: reflection/classes/singleton.md -->

##### singleton

类装饰器，使类变为单例。需要 TC39 Stage 3 装饰器支持。

**类型:** `(type?: SingletonType) => ClassDecorator`

**参数:**
- `type` — 重复创建时的行为，默认 `SingletonType.ReturnSame`

**SingletonType 枚举:**
| 值 | 说明 |
|---|---|
| `Throw` (0) | 重复创建时抛出错误 |
| `ReturnSame` (1) | 重复创建时返回已有实例 |

---

##### createSingleton

手动创建并缓存类的单例实例 (保存在类自身上)。

**类型:** `<T>(Class: new () => T) => T`

<!-- File: reflection/methods/bind.md -->

##### bindThis

方法装饰器，将方法自动 bind 到实例。需要 TC39 Stage 3 装饰器支持。

**类型:** `(method: Function, context: ClassMethodDecoratorContext) => Function | undefined`

仅适用于实例方法 (非静态、非私有时使用 `addInitializer`，私有方法直接包装)。

**示例:**
```typescript
class Foo {
  @bindThis
  handleClick() { /* this 始终是实例 */ }
}
```

<!-- File: reflection/methods/memorize.md -->

##### memo

方法装饰器，记忆第一次调用的返回值。再次调用时直接返回缓存值 (不重新执行)。需要 TC39 Stage 3 装饰器支持。

**类型:** `<T extends (...args: any[]) => any>(method: T, context: ClassMethodDecoratorContext) => T`

---

##### forgetMemorized

清除 `@memo` 装饰的方法的缓存，使下次调用重新执行。

**类型:** `<T>(self: T, methodName: keyof T) => void`

若方法未使用 `@memo` 装饰则抛出错误。

<!-- File: schedule/extendable-timer.md -->

##### ExtendableTimer

可反复推迟触发时间的定时器，类似"防抖"场景。

**类型:** `class ExtendableTimer implements IDisposable`

构造函数: `constructor(durationMs: number)`

成员:

| 成员 | 说明 |
|---|---|
| `start()` | 启动定时器；若已在计时则重置计时 |
| `renew()` | 重置计时 (仅在运行中有效) |
| `cancel()` | 取消定时器，Promise 以 `CanceledError` reject |
| `p` | 等待触发的 Promise |
| `onSchedule` | `p.then.bind(p)` 的快捷方式 |
| `dispose` | 同 `cancel` |

**示例:**
```typescript
const timer = new ExtendableTimer(500);
timer.start();
// 每次输入重新延迟
input.on('change', () => timer.renew());
await timer.p; // 500ms 无输入后触发
```

<!-- File: schedule/interval.md -->

##### interval

创建一个 `setInterval` 定时器，返回可 dispose 的对象。

**类型:** `(ms: number, action: () => void, unref?: boolean) => IDisposable`

**参数:**
- `ms` — 间隔毫秒数
- `action` — 定时回调
- `unref` — 仅 Node.js，是否调用 `.unref()`，默认 `false`

---

##### Interval

可暂停/恢复的定时器类，继承自 `EnhancedDisposable`。

**类型:** `class Interval extends EnhancedDisposable`

构造函数: `constructor(ms: number, unref?: boolean)`

成员:

| 成员 | 说明 |
|---|---|
| `onTick` | `EventRegister<void>` 事件，每次定时触发 |
| `resume()` | 开始计时 |
| `pause()` | 暂停计时 |
| `reset()` | 重新启动计时 |
| `fire()` | 立即触发一次 onTick |

<!-- File: schedule/scheduler.md -->

##### scheduler

跨平台的微任务调度函数。在 Node.js 中使用 `process.nextTick`，在浏览器中使用 `queueMicrotask` (回退到 `setTimeout`)。

**类型:** `(task: Function) => void`

<!-- File: schedule/timeout.md -->

超时与延时相关工具

##### timeout

创建一个在指定时间后 reject `TimeoutError` 的 Promise

- `ms`: `number` - 超时毫秒数
- `error`?: `string` - 错误消息(默认 `'no response'`)
- `boundary`?: `Function` - 用于清理调用栈的边界函数
- `unref`?: `boolean` - 是否调用 timer 的 `unref()`(默认 `false`; 非 Node.js 环境设为 `true` 会报错)
- 返回: `Promise<never>` - 超时后 reject

##### sleep

创建一个在指定时间后 resolve 的 Promise

- `ms`: `number` - 延时毫秒数
- `unref`?: `boolean` - 是否调用 timer 的 `unref()`(默认 `false`)
- 返回: `Promise<void>`

```typescript
await sleep(1000); // 等待1秒
```

##### raceTimeout

将一个 Promise 与超时竞争, 超时则 reject `TimeoutError`

- `ms`: `number` - 超时毫秒数
- `message`?: `string` - 超时错误消息
- `p`: `PromiseLike<T>` - 要竞争的 Promise
- 返回: `Promise<T>`

```typescript
const data = await raceTimeout(5000, '请求超时', fetchData());
```

##### raceTimeoutWithRetry

带重试的超时竞争; 每次超时后会再次调用 factory 创建新 Promise, 同时之前的请求仍在运行(并行竞争)

注意: 多次重试会并行, 如果之前的请求突然成功, 后续重试的结果会被丢弃; 建议用于幂等请求

- `ms`: `number` - 每次尝试的超时毫秒数
- `retry`: `number` - 最大尝试次数
- `factory`: `() => Promise<T>` - 创建请求的工厂函数
- 返回: `Promise<T>` - 第一个在超时内完成的结果

```typescript
const data = await raceTimeoutWithRetry(3000, 3, () => fetch(url).then(r => r.json()));
```

<!-- File: state/simple-state-machine.md -->

##### SimpleStateMachine

简单状态机，基于规则映射驱动状态转移，状态变化时触发事件。

**类型:** `class SimpleStateMachine<StateType, EventType>`

构造函数: `constructor(rules: ISsmRuleMap<StateType, EventType>, init_state: StateType)`

- `rules` — 状态转移规则，类型为 `Map<StateType, Map<EventType, StateType>>`
- `init_state` — 初始状态 (必须在规则中存在)

成员:

| 成员 | 说明 |
|---|---|
| `getName()` | 返回当前状态 |
| `change(event)` | 触发事件，若事件或当前状态不在规则中则抛出错误 |
| `onStateChange` | `EventRegister<IStateChangeEvent<StateType, EventType>>` |

`IStateChangeEvent` 包含 `from`、`to`、`reason` 字段。

<!-- File: string/case-cast.md -->

##### camelCase

将含 `-`、`.`、`/`、`_` 分隔符的字符串转为驼峰格式。

**类型:** `(str: string) => string`

---

##### ucfirst

将字符串首字母大写。返回类型为 `Capitalize<T>`。

**类型:** `<T extends string>(str: T) => Capitalize<T>`

---

##### lcfirst

将字符串首字母小写。返回类型为 `Uncapitalize<T>`。

**类型:** `<T extends string>(str: T) => Uncapitalize<T>`

---

##### linux_case

将字符串转为 `snake_case` 格式 (下划线分隔、全小写)。

**类型:** `(str: string) => string`

---

##### linux_case_hyphen

将字符串转为 `kebab-case` 格式 (连字符分隔、全小写)。

**类型:** `(str: string) => string`

<!-- File: string/concatType.generated.md -->

类型安全的字符串拼接函数(生成文件)

##### concatStringType

将多个字符串字面量类型参数拼接为模板字面量类型; 支持 1-20 个参数

- `...args`: `string[]` - 要拼接的字符串(每个参数为 `extends string` 的泛型)
- 返回: 模板字面量类型 `` `${T0}${T1}...` ``

```typescript
const result = concatStringType('hello', '-', 'world');
// 类型为 'hello-world', 值也是 'hello-world'
```

<!-- File: string/concatType.generator.md -->

此文件为代码生成器，不导出面向用户的公开 API。`concatStringType.generator.ts` 使用 `@build-script/codegen` 生成多个重载版本的 `concatStringType` 函数，支持最多 20 个泛型字符串参数，返回其拼接后的字面量类型。

<!-- File: string/escape-regexp.md -->

##### escapeRegExp

对字符串中的正则表达式特殊字符进行转义，使其可安全用于 `new RegExp()` 构造函数。

**类型:** `(str: string) => string`

<!-- File: string/human-bytes.md -->

##### humanSize

将字节数转换为可读字符串，使用二进制前缀 (1024)，如 `1.50KiB`。

**类型:** `(bytes: number, fixed?: number) => string`

**参数:**
- `bytes` — 字节数
- `fixed` — 小数位数，默认 `2`

支持单位: B、KiB、MiB、GiB、TiB、PiB。负数返回 `'<0B'`。

---

##### humanSizeSI

将字节数转换为可读字符串，使用 SI 前缀 (1000)，如 `1.50KB`。

**类型:** `(bytes: number, fixed?: number) => string`

<!-- File: string/pad2.md -->

##### pad2

将数字填充为两位字符串，不足两位时在前面补 `'0'`，用于时间格式化。

**类型:** `(s: number) => string`

<!-- File: tsconfig.md -->

此为 TypeScript 配置文件，不包含可文档化的公开 API。配置了 `stripInternal: true`（排除 `@internal` 标记的符号）并排除 `*.generator.ts` 和 `*.test.ts` 文件。

<!-- File: typing-helper/callback.md -->

##### ICommonCallback

Node.js 风格的回调函数接口，支持错误优先模式。

```typescript
interface ICommonCallback<T> {
  (error: null | undefined, data: T): void;
  (error: Error): void;
}
```

<!-- File: typing-helper/deep.partial.md -->

##### DeepPartial

深度递归地将类型的所有属性变为可选，支持 `Array`、`Map`、`Set` 等容器类型。

**类型:** `type DeepPartial<T>`

<!-- File: typing-helper/deep.readonly.md -->

##### DeepReadonly

深度递归地将类型的所有属性变为只读，支持 `Array`、`Map`、`Set` 等容器类型。

**类型:** `type DeepReadonly<T>`

<!-- File: typing-helper/deep.required.md -->

##### DeepNonNullable

深度递归地去除类型中所有属性的 `null` 和 `undefined`，支持 `Array`、`Map`、`Set` 等容器类型。

**类型:** `type DeepNonNullable<T>`

<!-- File: typing-helper/deep.writable.md -->

##### DeepWriteable

深度递归地去除类型的所有 `readonly` 修饰符，支持 `Array`、`Map`、`Set` 等容器类型。

**类型:** `type DeepWriteable<T>`

---

##### Writeable

浅层去除 `readonly` 修饰符，仅处理顶层属性及 `ReadonlyArray`/`ReadonlyMap`/`ReadonlySet` 类型。

**类型:** `type Writeable<T>`

<!-- File: typing-helper/literal.md -->

##### Primitive

基本类型联合: `undefined | null | boolean | string | number | Function | bigint`。

用于深度类型工具 (DeepReadonly 等) 的递归终止条件。

