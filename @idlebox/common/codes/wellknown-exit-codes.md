<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### ExitCode

常见进程退出码枚举:

| 值 | 含义 |
|---|---|
| `SUCCESS` (0) | 正常退出 |
| `EXECUTION` (1) | 运行时错误 |
| `INTERRUPT` (2) | 收到中断信号 |
| `USAGE` (3) | 参数使用错误 |
| `TIMEOUT` (4) | 未处理的超时 |
| `INVALID_STATE` (5) | 工作状态异常 |
| `PROGRAM` (66) | 程序代码缺陷 |
| `RESOURCE` (100) | 资源错误 |
| `DUPLICATE` (101) | 重复操作 |
| `UNKNOWN` (233) | 未曾设想的错误 |
