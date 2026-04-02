<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

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

<!-- spawnWithoutOutputSync is deprecated
Type: (cmd: ICommand) => void -->
<!-- spawnWithoutOutput is deprecated
Type: (cmd: ICommand) => Promise<void> -->
<!-- spawnGetOutputSync is deprecated
Type: (cmd: ICommand) => string -->
<!-- spawnGetOutput is deprecated
Type: (cmd: ICommand) => Promise<string> -->
<!-- spawnGetEverything is deprecated
Type: (cmd: ICommand) => Promise<EveryOut> -->
