<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### EnhancedAsyncDisposable

异步资源容器类 (完整版)，可继承或直接用作 `DisposableStack`。

dispose 时按注册顺序逆序释放所有资源。所有资源释放完毕后再抛出异常 (只抛最后一个)。若 `onDisposeError` 有监听器则不抛出 (除非监听器重新抛出)。

实现了 `[Symbol.asyncDispose]`，兼容 `await using`。

继承自 `AbstractEnhancedDisposable`，参见该类的公共成员。

---

##### UnorderedAsyncDisposable

与 `EnhancedAsyncDisposable` 相同，但并发释放所有资源并忽略任何错误。

继承自 `EnhancedAsyncDisposable`。
