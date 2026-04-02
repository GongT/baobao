<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### parseStackLine

解析一行 V8 格式的 stack trace 字符串，返回结构化的 `IStructreStackLine` 对象，包含 `func`、`location`、`eval` 等字段。

**类型:** `(line: string) => IStructreStackLine`

---

##### parseStackString

解析完整的 stack trace 字符串 (多行)，返回 `IStructreStackLine[]`。

**类型:** `(stack: string) => IStructreStackLine[]`

---

##### IStructreStackLine

解析后的堆栈行结构:

| 字段 | 类型 | 说明 |
|---|---|---|
| `invalid` | `boolean?` | 是否解析失败 |
| `special` | `boolean?` | 特殊标记行 |
| `toString()` | `() => string` | 原始行内容 |
| `func` | `{name, alias?}?` | 函数名信息 |
| `location` | `{path, schema, line, column, isAbsolute}?` | 文件位置 |
| `eval` | `{eval_func, eval_line, eval_column, funcs}?` | eval 来源 |
