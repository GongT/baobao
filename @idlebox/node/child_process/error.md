<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

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
