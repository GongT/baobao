<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## stream/drainStream

流数据读取和写入等待工具

##### drainStream

从可读流中读取指定大小的数据到预分配的Buffer中

- `stream`: 源可读流
- `size`: 要读取的数据大小
- `start`: Buffer中的起始偏移量, 默认 `0`
- `extra`: Buffer末尾的额外空间, 默认 `0`
- 返回: `Promise<Buffer>` — 分配的Buffer(大小为 `start + size + extra`, 实际写入量可能小于 `size`)

##### drainWriteStream

等待可写流变为可写状态(drain事件)或关闭

- `stream`: 目标可写流
- 返回: `Promise<boolean> | boolean`
  - 当前可写时直接返回 `true`
  - 等待drain或close后返回 `false`
  - 发生错误时reject
