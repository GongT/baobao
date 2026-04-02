<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### DeepWriteable

深度递归地去除类型的所有 `readonly` 修饰符，支持 `Array`、`Map`、`Set` 等容器类型。

**类型:** `type DeepWriteable<T>`

---

##### Writeable

浅层去除 `readonly` 修饰符，仅处理顶层属性及 `ReadonlyArray`/`ReadonlyMap`/`ReadonlySet` 类型。

**类型:** `type Writeable<T>`
