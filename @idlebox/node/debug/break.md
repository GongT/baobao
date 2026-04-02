<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## debug/break

调试器断点工具

##### debuggerBreakUserEntrypoint

在用户入口脚本的第一行前调用, 模拟 `--inspect-brk` 的行为; 仅在调试器已连接且命令行包含 `--inspect-brk` 参数时触发断点

##### forceDebuggerBreak

强制触发调试器断点; 如果调试器未打开, 会先通过 `inspector.open()` 启动调试器

- `port`: 可选, 调试端口号
