<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### normalizeArray

将值统一转为数组形式。如果传入 `undefined`，则返回空数组。

**类型:** `<T>(input: T | T[]) => T[]`

**参数:**
- `input` — 单个值或数组

**返回:** 若 `input` 已是数组则原样返回；若是单个值则包裹为单元素数组；若是 `undefined` 则返回 `[]`。
