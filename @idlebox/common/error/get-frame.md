<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### getErrorFrame

从 `Error.stack` 中取出第 N 帧的字符串。

**类型:** `(e: IWithStack, frame: number, downIfEmpty?: boolean) => string`

**参数:**
- `e` — 含有 `stack` 属性的对象
- `frame` — 帧索引 (0-based，跳过第一行消息行)
- `downIfEmpty` — 若指定帧为空时，向下查找最近非空帧，默认 `false`

**返回:** 找到的帧字符串；若超出范围且未开启 `downIfEmpty` 则返回 `''`。
