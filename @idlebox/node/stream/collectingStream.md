<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## stream/collectingStream

将可读流的内容收集到内存中

##### streamToBuffer

将可读流的全部内容读取到内存中, 根据参数返回字符串或Buffer

- `stream`: 源可读流
- `raw`: 为 `true` 时返回 `Promise<Buffer>`; 为 `false` 时返回 `Promise<string>`

```typescript
const text = await streamToBuffer(readableStream, false);
const buf = await streamToBuffer(readableStream, true);
```

##### RawCollectingStream

继承自 `Writable`, 将写入的数据收集为 `Buffer`

构造函数可选传入源可读流, 自动进行 `pipe` 连接

| 成员 | 类型 | 说明 |
|------|------|------|
| getOutput() | `() => Buffer` | 获取当前已收集的Buffer数据 |
| clear() | `() => void` | 清空已收集的数据 |
| promise() | `() => Promise<Buffer>` | 等待流结束并返回完整数据 |

##### CollectingStream

继承自 `Writable`, 将写入的数据收集为字符串(objectMode)

构造函数可选传入源可读流, 自动进行 `pipe` 连接

| 成员 | 类型 | 说明 |
|------|------|------|
| getOutput() | `() => string` | 获取当前已收集的字符串数据 |
| clear() | `() => void` | 清空已收集的数据 |
| promise() | `() => Promise<string>` | 等待流结束并返回完整数据 |
