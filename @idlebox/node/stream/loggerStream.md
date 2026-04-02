<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## stream/loggerStream

将流数据通过日志函数输出的Transform流

##### LogFunction

日志函数类型: `(message: string, ...args: any[]) => void`

##### LoggerStream

继承自 `Transform`, 将流经的数据按行拆分后调用日志函数输出, 同时将原始数据继续传递

- `logFn`: 日志输出函数
- `prefix`: 可选前缀字符串, 会以 `{prefix} %s` 的格式传递给日志函数

##### HexDumpLoggerStream

继承自 `Transform`, 将流经的二进制数据以十六进制dump格式输出, 每行32字节(两组16字节), 同时将原始数据继续传递

- `logFn`: 日志输出函数
- `prefix`: 可选前缀字符串
