# Usage
<!-- last update: 2026-04-03 -->

Node.js 平台工具函数库, 提供子进程管理、流处理、文件系统操作、路径解析、环境变量管理、进程生命周期控制、加密哈希、调试工具和终端日志等功能, 是 @idlebox 系列库中面向 Node.js 运行时的核心工具集

### File: child_process/disposable.process.ts

## child_process/disposable.process

将子进程对象转换为可销毁(Disposable)模式

##### childProcessToDisposable

将 `ChildProcess` 对象包装为 `IDisposableEvents & IAsyncDisposable` 接口

- `process`: 子进程对象(需包含 `pid`, `exitCode`, `signalCode`, `kill`, `on` 等属性)
- `options`: 可选配置
  - `gracefulSignal`: 优雅退出信号, 默认 `'SIGTERM'`
  - `gracefulTimeout`: 优雅退出超时(毫秒), 默认 `5000`
  - `forceSignal`: 强制退出信号, 默认 `'SIGKILL'`
  - `closed`: 是否等待 `close` 事件(而非 `exit`), 默认 `true`
- 返回: 带有 `dispose()`, `onBeforeDispose`, `onPostDispose`, `onDisposeError` 的对象

进程自行退出时也会自动触发dispose事件

##### gracefulKillProcess

优雅终止子进程: 先发送信号, 超时后发送强制信号

- `process`: 子进程对象
- `signal`: 初始信号, 默认 `'SIGTERM'`
- `timeout`: 超时时间(毫秒), 默认 `5000`
- `killSignal`: 超时后的强制信号, 默认 `'SIGKILL'`
- 返回: `Promise<string | number>` — 进程退出码或信号

##### childProcessClosed

等待子进程的 `close` 事件

- `process`: 子进程对象
- 返回: `Promise<number | string>` — 退出码或信号; 已关闭则立即返回

##### childProcessExited

等待子进程的 `exit` 事件

- `process`: 子进程对象
- 返回: `Promise<number | string>` — 退出码或信号; 已退出则立即返回

### File: child_process/error.ts

## child_process/error

子进程执行结果检查

##### checkChildProcessResult

检查子进程执行结果, 根据退出状态抛出相应错误

- `result`: 子进程状态对象, 兼容 `child_process` 同步返回值、异步进程和 execa 结果
- 返回: `void` — 正常退出(code=0)时不抛出
- 抛出:
  - 启动失败: `"{title} failed to start: {message}"`
  - 超时: `"{title} timed out (killed)"`
  - 信号终止: `"{title} killed by signal {signal}"`
  - 非零退出: `"{title} exit with code {code}"`
  - 其他失败: `"{title} process failed to spawn"` 或 `"{title} status unknown"`

### File: child_process/execa.ts

## child_process/execa

基于 [execa](https://www.npmjs.com/package/execa) 的命令执行封装

##### ICommand

命令执行参数接口

- `exec`: 命令和参数数组, 如 `['node', '--version']`
- `addonPath`: 可选, 额外的 PATH 路径数组
- `cwd`: 可选, 工作目录
- `env`: 可选, 环境变量

##### SpawnHelper

封装了 execa 的 spawn 配置管理类

- 构造函数: `new SpawnHelper(options: AsyncOptions)` — 传入 execa 选项
- `spawn`: 基于配置创建的执行方法
- `extend(options)`: 扩展当前配置, 返回新的 `SpawnHelper` 实例

##### AddonResultPromise

execa 的 `ResultPromise` 加上 `IDisposableEvents` 和 `IAsyncDisposable` 接口的联合类型

### File: child_process/lateError.ts

## child_process/lateError

延迟错误输出的命令执行器

##### execLazyError

运行命令, 正常结束时丢弃 stderr 输出; 出错时才将缓冲的 stderr(和可能的 stdout)输出到控制台

- `cmd`: 命令名
- `args`: 参数数组
- `spawnOptions`: execa 选项(排除 `stdio` 系列字段), 额外支持:
  - `verbose`: 为 `true` 时在执行前输出命令行
  - `stdout`: 为 `'inherit'` 或 `undefined` 时, 转为 `'pipe'` 并启用 `all` 合并输出
- 返回: `Promise<ExecaReturnValue>` — execa 执行结果

出错时会向 stderr 输出格式化的错误信息, 包含命令、工作目录和缓冲的输出内容; 抛出的错误对象上附加 `stderr`, `stdout`, `all` 属性(不可枚举)

##### ISpawnOptions

execa `Options` 的子集, 排除了 `lines`, `reject`, `stdio`, `encoding`, `all`, `stderr`, `verbose`(布尔类型重定义)

##### ExecaReturnValue

execa `Result` 类型, 基于传入选项推断stdout类型

### File: child_process/respawn.ts

## child_process/respawn

在 Linux pid/cgroup/mount 命名空间中重启当前进程

##### respawnInScope

在 Linux 命名空间隔离环境中重新启动当前 Node.js 进程; 应用逻辑必须放在 `mainFunc` 回调内

- `mainFunc`: 应用主函数
- 返回: 如果不需要重启(已在命名空间中、不支持、或设置了 `NEVER_UNSHARE` 环境变量), 直接调用 `mainFunc` 并返回 `undefined`; 否则通过 `execve` 替换当前进程(never返回)

使用 `unshare` 命令实现, 需要 Linux 环境; 非 root 用户自动添加 `--map-root-user` 参数

```typescript
import { respawnInScope } from '@idlebox/node';
respawnInScope(() => {
  import('./real-application');
});
```

### File: cli-io/output.ts

## cli-io/output

终端输出工具

##### printLine

向 stderr 输出一行分隔线

- `char`: 重复的字符, 默认 `'-'`
- 分隔线宽度为终端列数, 非终端时为10

### File: crypto/md5.ts

## crypto/md5

MD5 哈希计算

##### md5

计算数据的 MD5 哈希值

- `data`: `Uint8Array | string` 输入数据
- 返回: `string` — 十六进制编码的哈希字符串

### File: crypto/sha256.ts

## crypto/sha256

SHA-256 哈希计算

##### sha256

计算数据的 SHA-256 哈希值

- `data`: `Uint8Array` 输入数据
- 返回: `string` — 十六进制编码的哈希字符串

### File: debug/break.ts

## debug/break

调试器断点工具

##### debuggerBreakUserEntrypoint

在用户入口脚本的第一行前调用, 模拟 `--inspect-brk` 的行为; 仅在调试器已连接且命令行包含 `--inspect-brk` 参数时触发断点

##### forceDebuggerBreak

强制触发调试器断点; 如果调试器未打开, 会先通过 `inspector.open()` 启动调试器

- `port`: 可选, 调试端口号

### File: debug/inspect.ts

## debug/inspect

检测当前进程是否在调试模式下运行

##### hasInspector

检测当前 Node.js 进程是否启用了调试器, 以下任一条件为 `true` 时返回 `true`:

- `inspector.url()` 返回非空值
- `process.execArgv` 包含 `--inspect` 或 `--inspect-brk` 参数
- `NODE_OPTIONS` 环境变量包含 `--inspect` 或 `--inspect-brk`

结果会被缓存, 仅首次调用时计算

### File: environment/findBinary.ts

## environment/findBinary

在 PATH 中查找可执行文件

##### findBinary

在 PATH 目录中搜索指定名称的可执行文件

- `what`: 要查找的文件名
- `pathvar`: 可选, `PathArray` 实例; 默认创建新的 `PathEnvironment`
- `cwd`: 可选, 工作目录; 默认 `process.cwd()`
- 返回: `string` — 找到时返回解析后的绝对路径, 未找到时返回空字符串 `''`

### File: environment/getEnvironment.ts

## environment/getEnvironment

大小写不敏感的环境变量操作

##### IEnvironmentResult

环境变量查询结果: `{ value: string | undefined; name: string }`

##### getEnvironment

大小写不敏感地获取环境变量

- `name`: 变量名
- `env`: 环境变量对象, 默认 `process.env`
- 返回: `IEnvironmentResult` — 包含实际的变量名和值; 优先精确匹配, 其次忽略大小写匹配

##### deleteEnvironment

大小写不敏感地删除环境变量(删除所有匹配的变体)

- `name`: 变量名
- `env`: 环境变量对象, 默认 `process.env`

##### cleanupEnvironment

清理环境变量的重复大小写变体, 保留一个实例

- `name`: 变量名
- `env`: 环境变量对象, 默认 `process.env`

优先保留精确匹配名称的变量; 如果没有精确匹配则保留第一个找到的

### File: environment/npmConfig.ts

## environment/npmConfig

读取 npm 配置值

##### getNpmConfigValue

获取 npm 配置项的值

- `field`: 配置项名称
- 返回: `Promise<string>` — 配置值; 未找到时返回空字符串

优先从 `npm_config_*` 环境变量中读取(自动转换为 linux_case 格式), 回退到执行 `npm config get` 命令

### File: environment/pathEnvironment.ts

## environment/pathEnvironment

PATH 环境变量管理

##### PATH_SEPARATOR

PATH 环境变量的分隔符: Windows 上为 `';'`, 其他平台为 `':'`

##### PathEnvironment

继承自 `PathArray`(@idlebox/common), 直接操作 `process.env` 中的 PATH 变量

构造函数:
- `varName`: 环境变量名, 默认 Windows 为 `'Path'`, 其他为 `'PATH'`
- `env`: 环境变量对象, 默认 `process.env`

初始化时自动读取当前 PATH 值并清理重复的大小写变体

| 成员 | 类型 | 说明 |
|------|------|------|
| add(p) | `(p: string) => this` | 添加路径, 自动同步到环境变量 |
| delete(p) | `(p: string) => boolean` | 删除路径, 自动同步到环境变量 |
| clear() | `() => void` | 清空所有路径, 自动同步到环境变量 |
| save() | `() => void` | 手动将当前内容写回环境变量 |

### File: events/dumpEventEmitter.ts

## events/dumpEventEmitter

调试工具: 拦截 EventEmitter 的 emit 调用

##### dumpEventEmitterEmit

替换 EventEmitter 的 `emit` 方法, 在每次触发事件时通过 `console.log` 输出事件名和参数

- `ev`: 要拦截的 EventEmitter 实例

### File: fs/commandExists.ts

## fs/commandExists

检查命令是否存在于 PATH 中

##### commandInPath

异步检查指定命令是否存在于系统 PATH 中(检查可执行权限)

- `cmd`: 命令名
- `alterExt`: 可选的文件扩展名数组; 未指定时 Windows 上自动尝试 `.exe`, `.bat`, `.cmd`, `.com`, `.ps1`
- 返回: `Promise<string | undefined>` — 找到时返回完整路径, 未找到返回 `undefined`

##### commandInPathSync

`commandInPath` 的同步版本

- `cmd`: 命令名
- `alterExt`: 可选的文件扩展名数组
- 返回: `string | undefined`

### File: fs/emptyDir.ts

## fs/emptyDir

清空目录内容

##### emptyDir

删除目录中的所有内容, 目录不存在时可选自动创建

- `path`: 目录路径
- `create_not_exists`: 目录不存在时是否自动创建, 默认 `true`

### File: fs/ensureDir.ts

## fs/ensureDir

确保目录存在

##### ensureDirExists

异步确保目录存在, 不存在时递归创建

- `dir`: 目录路径

##### ensureParentExists

异步确保文件的父目录存在, 不存在时递归创建

- `file`: 文件路径(会自动提取其父目录)

### File: fs/exists.ts

## fs/exists

文件存在性检查和安全读取

##### exists

异步检查文件或目录是否存在

- `path`: 文件路径
- 返回: `Promise<boolean>` — 存在返回 `true`, 不存在返回 `false`, 其他错误抛出

##### existsSync

同步检查文件是否存在, 直接re-export自 `node:fs`

##### readFileIfExists

安全读取文件, 文件不存在时返回空值而非抛出错误

- 签名与 `fs.readFile` 相同
- 文件不存在时: 如果指定了encoding则返回空字符串 `''`, 否则返回空Buffer
- 其他错误正常抛出

### File: fs/temp.lifecycle.ts

## fs/temp.lifecycle

临时文件/目录的生命周期管理, 进程退出时自动清理

##### createTempFolder

创建临时目录, 返回 `IDisposable` 对象

- `fullPath`: 目录绝对路径(必须不存在, 否则抛出错误)
- 返回: `IDisposable` — 调用 `dispose()` 时同步删除该目录
- 进程退出时自动异步清理所有未手动销毁的临时目录

##### createTempFile

注册临时文件, 返回 `IDisposable` 对象(不负责创建文件本身)

- `fullPath`: 文件绝对路径
- `force`: 为 `true` 时允许路径已存在, 默认 `false`
- 返回: `IDisposable` — 调用 `dispose()` 时同步删除该文件

##### cancelDeleteTempfile

取消所有临时文件/目录的自动清理; 调用后进程退出时不再删除临时文件

### File: fs/weiteChanged.ts

## fs/weiteChanged

仅在内容变化时写入文件

##### writeFileIfChangeSync

同步版本: 比较文件现有内容, 仅在内容不同时才写入

- `file`: 文件路径
- `data`: 要写入的内容(`string` 或 `Buffer`)
- 返回: `boolean` — `true` 表示文件被更新, `false` 表示内容未变化

##### writeFileIfChange

异步版本: 比较文件现有内容, 仅在内容不同时才写入

- `file`: 文件路径
- `data`: 要写入的内容(`string` 或 `Buffer`)
- 返回: `Promise<boolean>` — `true` 表示文件被更新, `false` 表示内容未变化

### File: lifecycle/custom-error-handlers.ts

## lifecycle/custom-error-handlers

为全局错误处理器注册自定义的错误类型处理函数

##### registerNodejsGlobalTypedErrorHandler

为指定的 Error 子类注册精确匹配的全局错误处理函数(不匹配子类)

- `ErrorCls`: Error的子类构造函数(不能是 `Exit` 的子类)
- `fn`: 处理函数 `(error: E) => void`
- 重复注册同一个类会抛出错误

##### registerNodejsGlobalTypedErrorHandlerWithInheritance

为指定的 Error 子类注册带继承匹配的全局错误处理函数(也匹配其子类)

- `ErrorCls`: Error的子类构造函数(不能是 `Exit` 的子类)
- `fn`: 处理函数 `(error: E) => void`

##### deleteNodejsGlobalTypedErrorHandler

删除已注册的全局错误处理函数

- `ErrorCls`: Error的子类构造函数
- `withInheritance`: 为 `true` 时删除继承匹配的处理函数, 为 `false` 时删除精确匹配的处理函数

##### registerNodejsGlobalErrorCodeHandler

为指定的 Node.js 错误码注册全局错误处理函数

- `code`: Linux 错误码或 Node.js 错误码(如 `'ENOENT'`, `'ERR_MODULE_NOT_FOUND'` 等)
- `fn`: 处理函数 `(error: NodeException) => void`
- 重复注册同一个错误码会抛出错误

### File: lifecycle/process-shutdown.ts

## lifecycle/process-shutdown

进程优雅关闭管理

##### setExitCodeIfNot

设置进程退出码; 仅在当前退出码为0或未设置时才修改

- `exitCode`: 要设置的退出码

##### shutdown

触发优雅关闭流程, 并抛出 `Exit` 异常

- `exitCode`: 退出码
- 返回: `never`

首次调用时会触发全局 dispose 流程(通过 `ensureDisposeGlobal`), 完成后调用 `process.exit`; 多次调用仅增加计数器

##### isShuttingDown

检查进程是否正在关闭中

- 返回: `boolean`

### File: lifecycle/unhandled.ts

## lifecycle/unhandled

Node.js 全局错误处理和退出管理

##### registerNodejsExitHandler

注册全局的 Node.js 退出处理器, 接管以下事件:

- `SIGINT` / `SIGTERM` 信号处理
- `uncaughtException` 未捕获异常
- `unhandledRejection` 未处理的Promise拒绝
- `beforeExit` 事件
- 替换 `process.exit` 为优雅关闭流程

参数:
- `_logger`: 可选日志输出对象, 需要实现 `log(message: string)` 方法, 可选实现 `verbose?(message: string)` 方法; 默认使用 `console.error`

错误处理逻辑:
1. 通过 `registerNodejsGlobalTypedErrorHandler` 注册的自定义处理器优先匹配
2. `UsageError` 直接输出消息
3. `InterruptError` (信号中断) 触发优雅关闭, 超过5次强制退出
4. 其他未处理错误打印堆栈并关闭

### File: lifecycle/workingDirectory.ts

## lifecycle/workingDirectory

VSCode Shell Integration 兼容的工作目录管理

##### workingDirectory

只读对象, 提供工作目录相关操作, 在 VSCode 终端集成环境下自动发送目录变更的转义序列

| 成员 | 类型 | 说明 |
|------|------|------|
| cwd() | `() => string` | 获取当前工作目录 |
| chdir(dir) | `(dir: string) => void` | 切换工作目录 |
| patchGlobal() | `() => void` | 将修改后的chdir注入到全局process |
| escapeVscodeCwd | `(path: string) => string` | 生成VSCode Shell Integration转义序列 |
| isVscodeShellIntegration | `boolean` | 当前是否在VSCode终端集成环境中 |

在非 VSCode 环境下, `cwd()` 和 `chdir()` 等同于 `process.cwd()` / `process.chdir()`; 在 VSCode 环境下, `chdir()` 会额外向 stderr 写入 OSC 633 转义序列通知 VSCode 目录变化

### File: log/terminal.ts

## log/terminal

终端彩色日志控制台

##### WrappedTerminalConsole

继承自 `WrappedConsole`(@idlebox/common), 为终端环境添加 ANSI 颜色支持

构造函数:
- `title`: 日志标题前缀
- `options`: 可选配置
  - `color`: 颜色配置
    - `false`: 禁用颜色
    - `undefined`(默认): 仅在 stdout 和 stderr 都是 TTY 时启用颜色
    - `Partial<colorMap>`: 自定义各级别的 ANSI 颜色代码

默认颜色映射:

| 级别 | ANSI 代码 | 效果 |
|------|----------|------|
| info | `38;5;14` | 青色 |
| success | `38;5;10` | 绿色 |
| debug | `2` | 暗色 |
| error | `38;5;9` | 红色 |
| trace | `2` | 暗色 |
| warn | `38;5;11` | 黄色 |
| assert | `38;5;9;7` | 红色反显 |

### File: path-resolve/findPackageRoot.ts

## path-resolve/findPackageRoot

查找npm包的根目录

##### findPackageRoot

通过 `require.resolve` 定位指定 npm 包的根目录(包含 `package.json` 的目录)

- `packageName`: 包名(如 `'lodash'`, `'@scope/pkg'`)
- `require`: 可选, 自定义的 `require` 函数; 默认使用 `createRequire(process.cwd())`
- 返回: `string` — 包根目录的绝对路径

当包的 `package.json` 未在 exports 中导出时, 会通过 `findUpUntilSync` 从包的入口文件向上搜索

### File: path-resolve/findUp.ts

## path-resolve/findUp

向上级目录逐层搜索文件

##### IFindOptions

搜索选项:

- `from`: 起始目录, 必须是绝对路径
- `file`: 要查找的文件名, 或文件名数组
- `top`: 可选, 搜索的最外层目录; 超出范围停止搜索
- `resolveSymlink`: 可选, 为 `false` 时使用 `join` 而非 `resolve`(不解析符号链接)

##### findUpUntil

异步向上搜索, 返回第一个匹配的文件路径

- `opts`: `IFindOptions`
- 返回: `Promise<string | null>` — 找到时返回绝对路径, 未找到返回 `null`

##### findUp

异步向上搜索, 以异步迭代器形式返回所有匹配的文件路径

- `opts`: `IFindOptions`
- 返回: `AsyncIterableIterator<string>`

##### findUpUntilSync

`findUpUntil` 的同步版本

- `opts`: `IFindOptions`
- 返回: `string | null`

##### findUpSync

同步向上搜索, 返回所有匹配的文件路径数组

- `opts`: `IFindOptions`
- 返回: `string[]`

### File: path-resolve/getAllUp.ts

## path-resolve/getAllUp

生成从根到目标的所有路径

##### getAllPathUpToRoot

将路径拆分为各级目录, 从根开始逐级拼接生成路径数组

- `from`: 要拆分的路径
- `append`: 可选, 每个路径后附加的子路径
- 返回: `string[]`

```typescript
getAllPathUpToRoot('/a/b/c');
// ['/a', '/a/b', '/a/b/c']

getAllPathUpToRoot('/a/b/c', 'node_modules');
// ['/a/node_modules', '/a/b/node_modules', '/a/b/c/node_modules']
```

### File: path-resolve/lrelative.ts

## path-resolve/lrelative

计算相对路径(始终使用正斜杠)

##### lrelative

计算从 `from` 到 `to` 的相对路径, 结果始终使用 `/` 分隔符

- `from`: 起始绝对路径
- `to`: 目标绝对路径
- 返回: `string` — 相对路径(如 `'../../foo/bar'` 或 `'./foo'`)
- 两个参数都必须是绝对路径, 否则抛出错误

### File: path-resolve/nodeResolvePathArray.ts

## path-resolve/nodeResolvePathArray

生成 Node.js 模块解析路径数组

##### nodeResolvePathArray

从指定目录开始, 向上生成每一级目录下的 `node_modules`(或自定义子目录)路径

- `from`: 起始目录
- `file`: 要附加的子目录名, 默认 `'node_modules'`
- 返回: `string[]` — 从 `from` 到根目录的所有路径

```typescript
nodeResolvePathArray('/a/b/c');
// ['/a/b/c/node_modules', '/a/b/node_modules', '/a/node_modules']
```

### File: path-resolve/resolvePath.ts

## path-resolve/resolvePath

跨平台路径解析工具(Windows上统一使用正斜杠)

##### ResolvePathFunction

类型: `(...pathSegments: string[]) => string`

##### JoinPathFunction

类型: `(from: string, to: string) => string`

##### NormalizePathFunction

类型: `(path: string) => string`

##### resolvePath

跨平台的 `path.resolve`, Windows 上自动将反斜杠转为正斜杠

##### normalizePath

跨平台的 `path.normalize`, Windows 上自动将反斜杠转为正斜杠

##### relativePath

跨平台的 `path.relative`, Windows 上自动将反斜杠转为正斜杠

##### osTempDir

获取系统临时目录路径

- `name`: 可选子目录名
- 返回: `string` — 临时目录的绝对路径; 传入 `name` 时返回临时目录下的子路径

### File: stream/blackHoleStream.ts

## stream/blackHoleStream

丢弃所有写入数据的流

##### BlackHoleStream

继承自 `Writable`, 所有写入的数据都会被丢弃(类似 `/dev/null`)

### File: stream/collectingStream.ts

## stream/collectingStream

将可读流的内容收集到内存中

##### streamToBuffer

将可读流的全部内容读取到内存中, 根据参数返回字符串或Buffer

- `stream`: 源可读流
- `raw`: 为 `true` 时返回 `Promise<Buffer>`; 为 `false` 时返回 `Promise<string>`

```typescript
const text = await streamToBuffer(readableStream, false);
const buf = await streamToBuffer(readableStream, true);
```

##### RawCollectingStream

继承自 `Writable`, 将写入的数据收集为 `Buffer`

构造函数可选传入源可读流, 自动进行 `pipe` 连接

| 成员 | 类型 | 说明 |
|------|------|------|
| getOutput() | `() => Buffer` | 获取当前已收集的Buffer数据 |
| clear() | `() => void` | 清空已收集的数据 |
| promise() | `() => Promise<Buffer>` | 等待流结束并返回完整数据 |

##### CollectingStream

继承自 `Writable`, 将写入的数据收集为字符串(objectMode)

构造函数可选传入源可读流, 自动进行 `pipe` 连接

| 成员 | 类型 | 说明 |
|------|------|------|
| getOutput() | `() => string` | 获取当前已收集的字符串数据 |
| clear() | `() => void` | 清空已收集的数据 |
| promise() | `() => Promise<string>` | 等待流结束并返回完整数据 |

### File: stream/disposableStream.ts

## stream/disposableStream

为流对象添加 `IDisposable` 接口

##### disposableStream

将 `Writable` 或 `Readable` 流包装为可销毁对象, 添加 `dispose()` 方法

- `stream`: 要包装的流对象
- 返回: 原始流对象, 附加了 `dispose()` 方法

调用 `dispose()` 时, 如果流尚未关闭则调用 `stream.destroy()` 销毁流; 如果流已有 `dispose` 属性则直接返回原对象

### File: stream/drainStream.ts

## stream/drainStream

流数据读取和写入等待工具

##### drainStream

从可读流中读取指定大小的数据到预分配的Buffer中

- `stream`: 源可读流
- `size`: 要读取的数据大小
- `start`: Buffer中的起始偏移量, 默认 `0`
- `extra`: Buffer末尾的额外空间, 默认 `0`
- 返回: `Promise<Buffer>` — 分配的Buffer(大小为 `start + size + extra`, 实际写入量可能小于 `size`)

##### drainWriteStream

等待可写流变为可写状态(drain事件)或关闭

- `stream`: 目标可写流
- 返回: `Promise<boolean> | boolean`
  - 当前可写时直接返回 `true`
  - 等待drain或close后返回 `false`
  - 发生错误时reject

### File: stream/loggerStream.ts

## stream/loggerStream

将流数据通过日志函数输出的Transform流

##### LogFunction

日志函数类型: `(message: string, ...args: any[]) => void`

##### LoggerStream

继承自 `Transform`, 将流经的数据按行拆分后调用日志函数输出, 同时将原始数据继续传递

- `logFn`: 日志输出函数
- `prefix`: 可选前缀字符串, 会以 `{prefix} %s` 的格式传递给日志函数

##### HexDumpLoggerStream

继承自 `Transform`, 将流经的二进制数据以十六进制dump格式输出, 每行32字节(两组16字节), 同时将原始数据继续传递

- `logFn`: 日志输出函数
- `prefix`: 可选前缀字符串

### File: stream/streamPromise.ts

## stream/streamPromise

将流的结束/关闭事件转换为Promise

##### streamPromise

等待流的 end/finish/close 事件, 流发生error时reject

- `stream`: 可读流或可写流
- 返回: `Promise<void>`

如果流已经结束, 直接返回已resolve的Promise

##### streamHasEnd

检测流是否已经结束

- `stream`: 可读流或可写流
- 返回: `boolean` — 通过检查流内部 `_writableState.ended` 或 `_readableState.ended` 状态判断
