<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

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
