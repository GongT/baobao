<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### globalSingletonStrong

从全局注册表获取或创建强引用单例。若提供 `constructor` 且键不存在，则创建并保存。

**类型:** `<T>(symbol: symbol | string, constructor?: () => T) => T | undefined`

若不传 `constructor` 且键不存在，返回 `undefined`；若 constructor 返回 `undefined` 则抛出 `TypeError`。

---

##### globalSingleton

与 `globalSingletonStrong` 类似，但以 `WeakRef` 保存，允许被 GC 回收。

**类型:** `<T>(symbol: symbol | string, constructor?: () => T) => T | undefined`

---

##### globalSingletonDelete

从全局注册表中删除指定键。

**类型:** `(symbol: symbol | string) => void`
