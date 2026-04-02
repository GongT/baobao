<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### arrayDiff

比较两个数组，返回从 `before` 到 `after` 的变化。

**类型:** `<T>(before: readonly T[], after: readonly T[]) => IArrayUpdate<T>`

**参数:**
- `before` — 变更前的数组
- `after` — 变更后的数组

**返回:** `IArrayUpdate<T>` 对象，包含三个字段:
- `add` — 新增的元素
- `del` — 删除的元素
- `same` — 未变化的元素

**示例:**
```typescript
const result = arrayDiff(['a', 'b', 'c'], ['b', 'c', 'd']);
// result.add = ['d'], result.del = ['a'], result.same = ['b', 'c']
```
