<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### arrayChunk

将数组按指定大小分割为多个子数组的生成器函数。

**类型:** `<T>(arr: T[], size: number) => Generator<T[]>`

**参数:**
- `arr` — 要分割的数组
- `size` — 每个子数组的最大长度

**返回:** 依次产出每个子数组，最后一个子数组长度可能小于 `size`。

**示例:**
```typescript
for (const chunk of arrayChunk([1, 2, 3, 4, 5], 2)) {
  console.log(chunk); // [1,2], [3,4], [5]
}
```
