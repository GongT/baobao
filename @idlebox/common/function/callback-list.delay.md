<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### MemorizedOnceCallbackList

记忆最后一次 `run()` 的参数。第一次调用 `run()` 后，后续所有通过 `add()` 注册的回调会立即被调用并传入记忆的参数。

**类型:** `class MemorizedOnceCallbackList<Argument extends unknown[]>`

成员列表:

| 成员 | 类型 | 说明 |
|---|---|---|
| `add(item)` | `(cb) => void` | 添加回调；若已 run，立即执行 |
| `run(...args)` | `(...args) => void` | 执行所有已注册回调并记忆参数 |
| `count()` | `() => number` | 返回列表长度 |
