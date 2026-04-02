<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### AsyncCallbackList

与 `CallbackList` 类似，但异步逐一执行所有回调。某个回调返回 `true` 时停止。

**类型:** `class AsyncCallbackList<Argument extends unknown[]>`

成员列表:

| 成员 | 类型 | 说明 |
|---|---|---|
| `add(item)` | `(cb) => number` | 添加回调，返回列表长度 |
| `remove(item)` | `(cb) => cb \| null` | 移除回调 |
| `run(...args)` | `async (...args) => boolean` | 按序异步执行所有回调，某个返回 `true` 时停止 |
| `reset()` | `() => void` | 清空列表 |
| `count()` | `() => number` | 返回列表长度 |
