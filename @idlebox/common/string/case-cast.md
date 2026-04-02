<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### camelCase

将含 `-`、`.`、`/`、`_` 分隔符的字符串转为驼峰格式。

**类型:** `(str: string) => string`

---

##### ucfirst

将字符串首字母大写。返回类型为 `Capitalize<T>`。

**类型:** `<T extends string>(str: T) => Capitalize<T>`

---

##### lcfirst

将字符串首字母小写。返回类型为 `Uncapitalize<T>`。

**类型:** `<T extends string>(str: T) => Uncapitalize<T>`

---

##### linux_case

将字符串转为 `snake_case` 格式 (下划线分隔、全小写)。

**类型:** `(str: string) => string`

---

##### linux_case_hyphen

将字符串转为 `kebab-case` 格式 (连字符分隔、全小写)。

**类型:** `(str: string) => string`
