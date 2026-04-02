<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## lifecycle/custom-error-handlers

为全局错误处理器注册自定义的错误类型处理函数

##### registerNodejsGlobalTypedErrorHandler

为指定的 Error 子类注册精确匹配的全局错误处理函数(不匹配子类)

- `ErrorCls`: Error的子类构造函数(不能是 `Exit` 的子类)
- `fn`: 处理函数 `(error: E) => void`
- 重复注册同一个类会抛出错误

##### registerNodejsGlobalTypedErrorHandlerWithInheritance

为指定的 Error 子类注册带继承匹配的全局错误处理函数(也匹配其子类)

- `ErrorCls`: Error的子类构造函数(不能是 `Exit` 的子类)
- `fn`: 处理函数 `(error: E) => void`

##### deleteNodejsGlobalTypedErrorHandler

删除已注册的全局错误处理函数

- `ErrorCls`: Error的子类构造函数
- `withInheritance`: 为 `true` 时删除继承匹配的处理函数, 为 `false` 时删除精确匹配的处理函数

##### registerNodejsGlobalErrorCodeHandler

为指定的 Node.js 错误码注册全局错误处理函数

- `code`: Linux 错误码或 Node.js 错误码(如 `'ENOENT'`, `'ERR_MODULE_NOT_FOUND'` 等)
- `fn`: 处理函数 `(error: NodeException) => void`
- 重复注册同一个错误码会抛出错误

<!-- getHandlerOnError is internal
Type: (e: Error) => MyCallback<[Error]> | undefined -->
<!-- getCodehandler is internal
Type: (error: NodeException) => MyCallback<[NodeException]> | undefined -->
