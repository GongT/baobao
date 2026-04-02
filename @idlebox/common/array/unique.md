<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### arrayUnique

返回去除重复元素后的新数组 (保留最后一次出现)。

**类型:** `<T>(arr: readonly T[]) => T[]`

---

##### arrayUniqueReference

原地从数组中删除重复元素 (保留最后一次出现)。

**类型:** `(arr: any[]) => void`

---

##### uniqueFilter

返回一个可用于 `Array.prototype.filter()` 的函数，过滤已见过的元素。该函数可在多个数组间复用，会记住所有已见元素。

**类型:** `<T>(idFactory?: IUniqueIdFactory<T>) => (item: T) => boolean`

**参数:**
- `idFactory` — 可选，将元素转换为唯一 id 字符串的函数，默认直接将元素强转为字符串

**示例:**
```typescript
const filter = uniqueFilter<{ id: number }>(item => String(item.id));
const result = [...arr1, ...arr2].filter(filter);
```
