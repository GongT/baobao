<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## child_process/lateError

延迟错误输出的命令执行器

##### execLazyError

运行命令, 正常结束时丢弃 stderr 输出; 出错时才将缓冲的 stderr(和可能的 stdout)输出到控制台

- `cmd`: 命令名
- `args`: 参数数组
- `spawnOptions`: execa 选项(排除 `stdio` 系列字段), 额外支持:
  - `verbose`: 为 `true` 时在执行前输出命令行
  - `stdout`: 为 `'inherit'` 或 `undefined` 时, 转为 `'pipe'` 并启用 `all` 合并输出
- 返回: `Promise<ExecaReturnValue>` — execa 执行结果

出错时会向 stderr 输出格式化的错误信息, 包含命令、工作目录和缓冲的输出内容; 抛出的错误对象上附加 `stderr`, `stdout`, `all` 属性(不可枚举)

##### ISpawnOptions

execa `Options` 的子集, 排除了 `lines`, `reject`, `stdio`, `encoding`, `all`, `stderr`, `verbose`(布尔类型重定义)

##### ExecaReturnValue

execa `Result` 类型, 基于传入选项推断stdout类型
