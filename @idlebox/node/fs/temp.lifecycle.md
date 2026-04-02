<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

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
