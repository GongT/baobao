<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

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

<!-- shutdown_immediate is internal
Type: (code?: number) => never -->
<!-- shuttingDownCounter is internal
Type: number -->
<!-- _shutdown_graceful is internal
Type: (exitCode: number) => void -->
