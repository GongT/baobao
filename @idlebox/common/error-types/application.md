<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### Exit

程序正常退出时抛出的错误。捕获到此错误时应直接重新抛出，不做其他处理。

**类型:** `class Exit extends ErrorWithCode`

构造函数: `constructor(code: number, opts?: IErrorOptions)`

---

##### Quit

`Exit` 的子类，退出码为 `ExitCode.SUCCESS` (0)。

**类型:** `class Quit extends Exit`

---

##### InterruptError

程序因收到 SIGINT 或 SIGTERM 信号而中断。

**类型:** `class InterruptError extends ErrorWithCode`

构造函数: `constructor(signal: Signals, opts?: IErrorOptions)`

- `signal` — 触发中断的信号名

---

##### UsageError

因参数或配置错误导致的错误 (非程序问题)。

**类型:** `class UsageError extends ErrorWithCode`

构造函数: `constructor(message: string, opts?: IErrorOptions)`
