<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

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

<!-- die is deprecated
Type: (message: string) => never -->
