<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## stream/streamPromise

将流的结束/关闭事件转换为Promise

##### streamPromise

等待流的 end/finish/close 事件, 流发生error时reject

- `stream`: 可读流或可写流
- 返回: `Promise<void>`

如果流已经结束, 直接返回已resolve的Promise

##### streamHasEnd

检测流是否已经结束

- `stream`: 可读流或可写流
- 返回: `boolean` — 通过检查流内部 `_writableState.ended` 或 `_readableState.ended` 状态判断
