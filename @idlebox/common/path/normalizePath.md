<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### PathKind

路径类型枚举:

| 值 | 说明 |
|---|---|
| `url` (0) | URL (含 schema) |
| `unc` (1) | UNC 路径 (`\\?\UNC\`) |
| `win` (2) | Windows 路径 (`C:\`) |
| `cifs` (3) | CIFS/Samba 路径 (`\\server\`) |
| `unix` (4) | Unix 绝对路径 (`/`) |
| `relative` (5) | 相对路径 |

---

##### analyzePath

解析路径字符串，返回 `IPathInfo` 对象，包含 `kind`、`prefix`、`path` (规范化后的路径段，使用 `/`) 等字段。同时处理 `..` 和 `.`。

**类型:** `(p: string) => IPathInfo`

---

##### normalizePath

将路径规范化: 替换 `\\` 为 `/`、删除末尾 `/`、处理 `..` 和 `.`。

**类型:** `(p: string) => string`

---

##### relativePath

计算从 `from` 到 `to` 的相对路径。两个路径必须是相同类型 (`PathKind`)。

**类型:** `(from: string, to: string) => string`
