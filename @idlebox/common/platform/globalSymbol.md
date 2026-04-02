<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### createSymbol

创建或获取指定分类下的命名 Symbol，类似于 `Symbol.for` 但有分类组织。

**类型:** `(category: string, name: string) => symbol`

---

##### deleteSymbol

从全局 Symbol 注册表中删除指定的 Symbol。

**类型:** `(category: string, name: string) => void`
