<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## fs/exists

文件存在性检查和安全读取

##### exists

异步检查文件或目录是否存在

- `path`: 文件路径
- 返回: `Promise<boolean>` — 存在返回 `true`, 不存在返回 `false`, 其他错误抛出

##### existsSync

同步检查文件是否存在, 直接re-export自 `node:fs`

##### readFileIfExists

安全读取文件, 文件不存在时返回空值而非抛出错误

- 签名与 `fs.readFile` 相同
- 文件不存在时: 如果指定了encoding则返回空字符串 `''`, 否则返回空Buffer
- 其他错误正常抛出
