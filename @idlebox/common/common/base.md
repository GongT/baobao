<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## 错误基类

此模块是 `@idlebox/errors` 私有包的内容，通过 `@idlebox/common` 导出。

#### ErrorWithCode

最基本的错误类型，所有自定义错误的基类。携带数字类型的错误码 `code`。

```typescript
class ErrorWithCode extends Error {
  constructor(message: string, code: number, opts?: IErrorOptions);
  readonly code: number;
  get name(): string;  // 返回构造函数名称
}
```

**参数说明**
- `opts.stack` — 提供自定义 stack 字符串时，会替换默认的堆栈追踪
- `opts.boundary` — 自定义 `captureStackTrace` 的边界函数，默认为构造函数本身

#### TypeErrorWithCode

同时具有 `Error` 和 `TypeError` 特征的错误类型，`instanceof TypeError` 检查会返回 `true`。

```typescript
class TypeErrorWithCode extends ErrorWithCode {}
```
