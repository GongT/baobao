<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## 应用级错误类型

此模块是 `@idlebox/errors` 私有包的内容，通过 `@idlebox/common` 导出。

#### Exit

程序正常退出的错误信号。捕获到此错误时应直接重新抛出，不做其他处理。

```typescript
class Exit extends ErrorWithCode {
  constructor(code: number, opts?: IErrorOptions);
}
```

#### Quit

`Exit` 的子类，使用 `ExitCode.SUCCESS`（0）退出。

```typescript
class Quit extends Exit {
  constructor(opts?: IErrorOptions);
}
```

#### InterruptError

由 `SIGINT`（Ctrl+C）或 `SIGTERM` 信号引起的中断错误。

```typescript
class InterruptError extends ErrorWithCode {
  constructor(signal: Signals, opts?: IErrorOptions);
  readonly signal: Signals;
}
```

#### UsageError

由于错误的参数或配置导致的错误（非程序 bug），通常对应 `ExitCode.USAGE`。

```typescript
class UsageError extends ErrorWithCode {
  constructor(message: string, opts?: IErrorOptions);
}
```
