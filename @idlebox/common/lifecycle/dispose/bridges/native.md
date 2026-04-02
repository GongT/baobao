<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### fromNativeDisposable

将原生 `Disposable` / `AsyncDisposable` 对象 (使用 `Symbol.dispose` / `Symbol.asyncDispose`) 转换为本包的 `IDisposable` / `IAsyncDisposable` 格式 (添加 `.dispose()` 方法)。

**类型:** `<T extends Disposable | AsyncDisposable>(disposable: T) => T & IDisposable & IAsyncDisposable`

注意: 返回的是同一对象，原地修改。

---

##### toNativeDisposableAsync

将 `IAsyncDisposable` 转换为原生 `AsyncDisposable`，添加 `[Symbol.asyncDispose]`。

**类型:** `(disposable: IAsyncDisposable) => AsyncDisposable`

---

##### toNativeDisposableSync

将 `IDisposable` 转换为原生 `Disposable`，添加 `[Symbol.dispose]`。

**类型:** `(disposable: IDisposable) => Disposable`
