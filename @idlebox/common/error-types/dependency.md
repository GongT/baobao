<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### DependencyError

依赖项错误，继承自 `ProgramError`。

**类型:** `class DependencyError extends ProgramError`

---

##### ChildProcessExitError

子进程意外退出错误，继承自 `DependencyError`。

**类型:** `class ChildProcessExitError extends DependencyError`

构造函数接收包含以下可选字段的配置对象:

| 字段 | 说明 |
|---|---|
| `pid` | 子进程 PID |
| `commandline` | 命令行参数 |
| `workingDirectory` | 工作目录 |
| `exitCode` | 退出码 |
| `signal` | 退出信号 |
| `process` | `ChildProcess` 实例 |
