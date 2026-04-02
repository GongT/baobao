<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## fs/weiteChanged

仅在内容变化时写入文件

##### writeFileIfChangeSync

同步版本: 比较文件现有内容, 仅在内容不同时才写入

- `file`: 文件路径
- `data`: 要写入的内容(`string` 或 `Buffer`)
- 返回: `boolean` — `true` 表示文件被更新, `false` 表示内容未变化

##### writeFileIfChange

异步版本: 比较文件现有内容, 仅在内容不同时才写入

- `file`: 文件路径
- `data`: 要写入的内容(`string` 或 `Buffer`)
- 返回: `Promise<boolean>` — `true` 表示文件被更新, `false` 表示内容未变化
