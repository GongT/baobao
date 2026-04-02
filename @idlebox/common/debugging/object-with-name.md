<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### objectName

获取对象的 `displayName` 或 `name` 属性。

**类型:** `<T>(func: NonNullable<T>) => string | undefined`

---

##### nameObject

为对象设置 `displayName` (或 `name`)，同时设置 `Symbol.toStringTag`。

**类型:** `<T extends {}>(name: string, object: T) => T & NamedObject`

**参数:**
- `name` — 要设置的名称
- `object` — 目标对象

**返回:** 同一对象 (类型包含 `NamedObject`)

---

##### assertObjectHasName

断言对象必须有 `displayName` 或 `name` 属性，否则抛出 `TypeError`。

**类型:** `<T>(func: NonNullable<T>) => asserts func is T & NamedObject`

---

##### functionName

与 `objectName` 相同，但如果没有名称则返回 `'<anonymous>'`。

**类型:** `(func: Function) => string`
