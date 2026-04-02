<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### isArraySame

判断两个数组是否完全相同 (元素顺序和引用均相同)。

**类型:** `<T>(a1: readonly T[], a2: readonly T[]) => boolean`

**参数:**
- `a1` — 第一个数组
- `a2` — 第二个数组

**返回:** 两个数组长度相同且每个对应位置元素严格相等 (`===`) 时返回 `true`，否则返回 `false`。
