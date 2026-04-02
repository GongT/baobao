<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### PathArrayPosix

处理 `PATH` 环境变量格式字符串的工具类，始终使用 `/`，分隔符为 `:`。

**类型:** `class PathArrayPosix`

---

##### PathArrayWindows

Windows 版 PATH 数组工具类，大小写不敏感，分隔符为 `;`。

**类型:** `class PathArrayWindows`

---

##### PathArray

根据当前平台自动选择 `PathArrayPosix` 或 `PathArrayWindows`。

两个类共有成员:

| 成员 | 说明 |
|---|---|
| `add(value, first?, force?)` | 添加路径，`first=true` 表示插入到开头，`force=true` 强制重新添加 |
| `delete(value)` | 删除路径 |
| `has(value)` | 是否包含 |
| `toString()` | 转换为 PATH 字符串 |
| `toArray()` | 转换为数组 |
| `joinpath(part)` | 为每个元素拼接后缀路径 |
| `clear()` | 清空 |
| `size` | 元素数量 |
