<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### ProxiedError

包装其他类型异常 (包括非 Error 对象) 的抽象代理错误类。`stack` 属性透明代理到 `cause.stack`。

**类型:** `abstract class ProxiedError extends Error`

---

##### UnhandledRejection

未处理的 Promise rejection 包装错误。

**类型:** `class UnhandledRejection extends ProxiedError`

构造函数: `constructor(reason: unknown, promise: Promise<unknown>)`

- `promise` — 发生未处理 rejection 的 Promise

---

##### UncaughtException

未捕获的异常包装错误。

**类型:** `class UncaughtException extends ProxiedError`

构造函数: `constructor(error: Error)`
