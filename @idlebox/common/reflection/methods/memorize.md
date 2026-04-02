<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### memo

方法装饰器，记忆第一次调用的返回值。再次调用时直接返回缓存值 (不重新执行)。需要 TC39 Stage 3 装饰器支持。

**类型:** `<T extends (...args: any[]) => any>(method: T, context: ClassMethodDecoratorContext) => T`

---

##### forgetMemorized

清除 `@memo` 装饰的方法的缓存，使下次调用重新执行。

**类型:** `<T>(self: T, methodName: keyof T) => void`

若方法未使用 `@memo` 装饰则抛出错误。
