<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## stream/disposableStream

为流对象添加 `IDisposable` 接口

##### disposableStream

将 `Writable` 或 `Readable` 流包装为可销毁对象, 添加 `dispose()` 方法

- `stream`: 要包装的流对象
- 返回: 原始流对象, 附加了 `dispose()` 方法

调用 `dispose()` 时, 如果流尚未关闭则调用 `stream.destroy()` 销毁流; 如果流已有 `dispose` 属性则直接返回原对象
