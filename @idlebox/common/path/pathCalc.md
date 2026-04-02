<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### isPathContains

检查两个路径是否存在父子关系。

**类型:** `(parent: string, child: string, equalsOk?: boolean) => boolean`

**参数:**
- `parent` — 父目录路径
- `child` — 子路径
- `equalsOk` — 路径相等是否视为父子关系，默认 `false`

**返回:** 若 `parent` 是 `child` 的父目录则返回 `true`。
