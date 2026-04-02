<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### ErrorWithCode

所有自定义错误的基类，在标准 `Error` 基础上增加 `code` 属性。

**类型:** `class ErrorWithCode extends Error implements IHumanReadable`

构造函数: `constructor(message: string, code: number, opts?: IErrorOptions)`

- `opts.boundary` — stack trace 边界函数
- `opts.cause` — 原始 cause
- `opts.stack` — 替换完整的 stack 字符串

成员:
- `code: number` — 错误代码
- `name` — 返回构造函数名

实现 `IHumanReadable` 接口，有默认的 `[humanReadable]()` 实现。

---

##### TypeErrorWithCode

同时具有 `Error` 和 `TypeError` 特征的错误类型，`instanceof TypeError` 检查返回 `true`。

**类型:** `class TypeErrorWithCode extends ErrorWithCode`
