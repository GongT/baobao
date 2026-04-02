<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### DeferredPromise

可延迟 resolve/reject 的 Promise 容器，支持进度通知。

**类型:** `class DeferredPromise<T, PT = any>`

构造函数: `constructor()`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `promise` | `Promise<T> & IProgressHolder<T, PT>` | 内部 Promise，支持 `.progress(fn)` |
| `p` | `Promise<T> & IProgressHolder<T, PT>` | `promise` 的别名 |
| `working` | `boolean` | 是否未 settled |
| `settled` | `boolean` | 是否已 settled |
| `resolved` | `boolean` | 是否已 resolve |
| `rejected` | `boolean` | 是否已 reject |
| `complete(value)` | `(value: T) => void` | resolve |
| `error(err)` | `(err) => void` | reject |
| `cancel()` | `() => void` | 以 `CanceledError` reject |
| `notify(progress)` | `(pt: PT) => this` | 通知进度 |
| `timeout(ms)` | `(ms) => IDisposable` | 设置超时，超时后以 `TimeoutError` reject |
| `callback` | `(error?, data?) => void` | Node.js 风格回调 |

**静态方法:**
- `DeferredPromise.wrap(prev)` — 将普通 Promise 包装为 DeferredPromise
