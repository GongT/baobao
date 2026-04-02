<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### CallbackList

管理一组同步回调函数的列表。在回调执行期间不允许添加、删除或重置。

**类型:** `class CallbackList<Argument extends unknown[]>`

构造函数:
- `constructor(initial?: readonly MyCallback<Argument>[])`

成员列表:

| 成员 | 类型 | 说明 |
|---|---|---|
| `add(item, name?)` | `(cb, name?) => number` | 添加回调，返回列表长度 |
| `remove(item)` | `(cb) => cb \| null` | 移除回调，返回被移除项或 null |
| `run(...args)` | `(...args) => boolean` | 执行所有回调；某个回调返回 `false` 时停止并返回 `false` |
| `reset()` | `() => void` | 清空列表 |
| `count()` | `() => number` | 返回列表长度 |
