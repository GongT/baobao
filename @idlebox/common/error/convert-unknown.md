<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### convertCaughtError

将 `catch` 捕获的任意值转换为 `Error` 对象。

**类型:** `(e: unknown) => Error`

若捕获到 `Exit` 错误，会直接重新抛出 (不应被包装)。若捕获到非 `Error` 值，会打印警告并包装为新的 `Error`。
