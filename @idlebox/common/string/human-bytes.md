<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### humanSize

将字节数转换为可读字符串，使用二进制前缀 (1024)，如 `1.50KiB`。

**类型:** `(bytes: number, fixed?: number) => string`

**参数:**
- `bytes` — 字节数
- `fixed` — 小数位数，默认 `2`

支持单位: B、KiB、MiB、GiB、TiB、PiB。负数返回 `'<0B'`。

---

##### humanSizeSI

将字节数转换为可读字符串，使用 SI 前缀 (1000)，如 `1.50KB`。

**类型:** `(bytes: number, fixed?: number) => string`
