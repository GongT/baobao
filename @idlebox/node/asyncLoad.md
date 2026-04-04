<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## executeMainFunction

异步主函数执行器，将异步入口函数包裹为顶层执行，并统一处理退出码和错误。

```typescript
type AsyncMainFunction = () => Promise<undefined | number> | Promise<void>;

function executeMainFunction(main: AsyncMainFunction, onExit?: OnExit): void;
```

**参数说明**
- `main` — 异步主函数，返回数字时设置为进程退出码
- `onExit` — 可选的退出回调，在 `main` 正常结束或抛出异常时均会调用

**特殊说明**
此函数已标记 `@deprecated`，建议改用 `registerNodejsExitHandler` 配合 `registerGlobalLifecycle`。捕获到 `Exit` 类型错误时，以其 `code` 作为退出码；其他错误调用 `prettyPrintError` 打印后强制退出。
