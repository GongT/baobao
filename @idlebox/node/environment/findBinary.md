<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## environment/findBinary

在 PATH 中查找可执行文件

##### findBinary

在 PATH 目录中搜索指定名称的可执行文件

- `what`: 要查找的文件名
- `pathvar`: 可选, `PathArray` 实例; 默认创建新的 `PathEnvironment`
- `cwd`: 可选, 工作目录; 默认 `process.cwd()`
- 返回: `string` — 找到时返回解析后的绝对路径, 未找到时返回空字符串 `''`
