<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## NodeErrorCode / OpenSSLErrorCode

从 [Node.js 官方错误文档](https://nodejs.org/api/errors.html) 自动提取生成的枚举，包含所有 Node.js 和 OpenSSL 错误代码字符串常量。

此模块是 `@idlebox/node-error-codes` 私有包的内容，作为 `@idlebox/common` 的一部分导出。

#### NodeErrorCode

包含 Node.js 所有内置错误代码的枚举，例如：

```typescript
enum NodeErrorCode {
  ABORT_ERR = 'ABORT_ERR',
  ERR_ACCESS_DENIED = 'ERR_ACCESS_DENIED',
  ERR_INVALID_ARG_TYPE = 'ERR_INVALID_ARG_TYPE',
  // ... 共100+个错误代码
}
```

每个枚举成员的 JSDoc 注释来自 Node.js 官方文档，包含该错误的详细说明。已废弃的遗留错误代码标记了 `@deprecated`。

#### OpenSSLErrorCode

包含 OpenSSL 错误代码的枚举，格式同 `NodeErrorCode`。
