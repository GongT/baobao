<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### timeout

返回一个在指定毫秒后以 `TimeoutError` reject 的 Promise，可用于超时检测。

**类型:** `(ms: number, error?: string, boundary?: Function, unref?: boolean) => Promise<never>`

**参数:**
- `ms` — 超时毫秒数
- `error` — 错误消息，默认 `'no response'`
- `boundary` — stack trace 边界函数
- `unref` — 仅 Node.js，默认 `false`

---

##### sleep

返回一个在指定毫秒后 resolve 的 Promise。

**类型:** `(ms: number, unref?: boolean) => Promise<void>`

---

##### raceTimeout

将 Promise 与超时竞争，超时则 reject `TimeoutError`。

**类型:** `<T>(ms: number, p: PromiseLike<T>) => Promise<T>` 或 `(ms: number, message: string, p: PromiseLike<T>) => Promise<T>`
