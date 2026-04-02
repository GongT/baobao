<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## debug/inspect

检测当前进程是否在调试模式下运行

##### hasInspector

检测当前 Node.js 进程是否启用了调试器, 以下任一条件为 `true` 时返回 `true`:

- `inspector.url()` 返回非空值
- `process.execArgv` 包含 `--inspect` 或 `--inspect-brk` 参数
- `NODE_OPTIONS` 环境变量包含 `--inspect` 或 `--inspect-brk`

结果会被缓存, 仅首次调用时计算
