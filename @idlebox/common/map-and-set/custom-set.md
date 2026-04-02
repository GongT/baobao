<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### CustomSet

使用自定义比较函数的 Set 抽象基类。

**类型:** `abstract class CustomSet<Type>`

需要继承并实现 `compare(item1, item2): number` 方法。

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `has(item)` | `(item) => boolean` | 是否包含 |
| `add(item)` | `(item) => boolean` | 添加，返回是否新增 |
| `addAll(items)` | `(items) => Type[]` | 批量添加，返回实际新增的元素 |
| `delete(item)` | `(item) => boolean` | 删除，返回是否存在 |
| `deleteAll(items)` | `(items) => Type[]` | 批量删除，返回实际删除的元素 |
| `clear()` | `() => void` | 清空 |
| `length` | `number` | 元素数量 |
| `toArray()` | `() => Type[]` | 转换为数组 |
