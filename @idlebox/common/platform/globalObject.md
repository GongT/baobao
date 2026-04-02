<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### globalObject

全局对象引用: 优先使用 `globalThis`，回退到 `window` (浏览器) 或 `global` (Node.js)。

**类型:** `any`

---

##### ensureGlobalObject

获取或创建全局单例 (保存于 `globalThis[Symbol.for(symbol)]`)。若已存在则直接返回。

**类型:** `<T>(symbol: string, constructor: () => T) => T`

---

##### ensureGlobalObjectSingleton

与 `ensureGlobalObject` 类似，但若已存在则抛出错误 (强制单例语义)。

**类型:** `<T>(symbol: string, constructor: () => T) => T`
