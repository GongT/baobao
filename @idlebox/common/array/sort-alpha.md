<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### sortByString

按字母顺序排序的比较函数，用于 `Array.prototype.sort()`。

**类型:** `(a: string, b: string) => number`

**示例:**
```typescript
['banana', 'apple', 'cherry'].sort(sortByString);
// ['apple', 'banana', 'cherry']
```
