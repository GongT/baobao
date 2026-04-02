<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### closableToDisposable

将具有 `close()` 方法的对象转换为 `IAsyncDisposable`。`close()` 可以接受回调或返回 `Promise`。

**类型:** `<T extends ClosableAsync>(closable: T) => IAsyncDisposable`

---

##### endableToDisposable

将具有 `end()` 方法的对象转换为 `IAsyncDisposable`。`end()` 可以接受回调或返回 `Promise`。

**类型:** `<T extends EndableAsync>(endable: T) => IAsyncDisposable`
