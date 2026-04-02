<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### RequiredMap

继承自 `Map`，`get()` 在键不存在时抛出错误。

**类型:** `class RequiredMap<K, V> extends Map<K, V>`

额外成员:

| 成员 | 说明 |
|---|---|
| `get(id)` | 键不存在时抛出错误 |
| `get(id, def)` | 键不存在时返回 `def` (不插入) |
| `entry(id, init)` | 键不存在时调用 `init(id)` 并保存，返回值 |

---

##### InstanceMap

继承自 `Map`，`get()` 在键不存在时自动创建实例。

**类型:** `abstract class InstanceMap<K, V> extends Map<K, V>`

需要继承并实现 `instance(key: K): V` 方法，该方法在键不存在时被调用来创建值。
