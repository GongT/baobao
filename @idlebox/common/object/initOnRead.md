<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### initOnRead

在目标对象上定义懒初始化属性 (prototype 级别)。第一次访问时调用 `init()` 并将结果缓存，后续访问直接返回缓存值。

**类型:** `<O, T extends keyof O>(target: any, propertyKey: T, init: (this: O) => O[T]) => void`

**参数:**
- `target` — 目标对象 (通常是 prototype)
- `propertyKey` — 属性名
- `init` — 初始化函数，`this` 指向访问该属性的实例

若属性已存在则跳过。
