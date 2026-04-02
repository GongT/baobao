<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### Emitter

事件发射器，实现 `IEventEmitter<T>` 接口。

**类型:** `class Emitter<T = unknown> implements IEventEmitter<T>`

构造函数: `constructor(displayName?: string, onErrorDefault?: FireErrorAction)`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `displayName` | `string` | 调试名称 |
| `register` | `EventRegister<T>` | handle 的别名，已 bind |
| `event` | `EventRegister<T>` | handle 的别名 |
| `handle(callback)` | `(cb) => IDisposable` | 添加监听器，已 bind |
| `once(callback)` | `(cb) => IDisposable` | 添加一次性监听器 |
| `wait()` | `() => Promise<T>` | 等待下次触发的 Promise |
| `fire(data, error?)` | `(data, error?) => void` | 触发事件 |
| `listenerCount()` | `() => number` | 当前监听器数量 |
| `disposed` | `boolean` | 是否已 dispose |
| `dispose()` | `() => void` | 释放所有监听器 |

`fire` 的 `error` 参数 (`Emitter.EAction`):
- `Throw` (默认) — 遇错立即抛出
- `Delay` — 全部执行后抛出 `AggregateError`
- `Ignore` — 忽略所有错误
- `PrintIgnore` — 打印错误但继续执行
