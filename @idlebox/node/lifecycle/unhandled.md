<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## registerNodejsExitHandler

注册 Node.js 进程级错误和退出处理器，统一处理未捕获异常、未处理 rejection、SIGINT/SIGTERM 信号等情况。

```typescript
function registerNodejsExitHandler(logger?: IDebugOutput): void;
```

**参数说明**
- `logger` — 可选的日志输出接口，默认使用 `console.error`

**特殊说明**
- 此函数为幂等操作，重复调用不会重复注册（使用 `ensureGlobalObject` 确保仅注册一次）
- 注册后会覆盖 `process.exit`，转为经过优雅退出流程的版本
- 不可再向 `process` 注册 `uncaughtException` 事件，注册尝试会被拦截并打印警告

**处理逻辑概述**
- `Exit` / `Quit` — 直接退出，不打印错误
- `InterruptError` — 打印信号信息后优雅退出，多次信号（>4次）立即退出
- `UsageError` — 打印用户友好的错误信息
- 自定义处理器 — 通过 `getHandlerOnError` / `getCodehandler` 获取匹配的处理器
- 其他错误 — 调用 `prettyPrintError` 打印后退出
