<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### setErrorLogRoot

设置错误堆栈格式化时使用的根目录，用于将绝对路径转换为相对路径。在 VSCode Shell Integration 环境中会同时发送 `Cwd` 序列。

**类型:** `(root: string) => void`

---

##### prettyPrintError

在控制台以格式化方式打印错误对象 (含分隔线、cause 链)。仅在 Node.js 环境有完整效果。

设置环境变量 `DISABLE_PRETTY_ERROR=yes` 可禁用格式化，`PRETTY_ERROR_LOCATION` 可同时打印调用位置。

**类型:** `<ErrorType>(type: string, e: ErrorType) => void`

---

##### prettyFormatStack

将一组堆栈行字符串格式化为带颜色的可读数组。

**类型:** `(stackLines: readonly string[]) => string[]`

---

##### prettyFormatError

格式化错误对象为字符串。

**类型:** `<ErrorType>(e: ErrorType, withMessage?: boolean) => string`

**参数:**
- `e` — 错误对象
- `withMessage` — 是否包含错误消息行，默认 `true`
