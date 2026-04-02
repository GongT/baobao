<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### vscEscapeValue

对字符串进行 VSCode Shell Integration 协议的转义:
- 反斜杠 → `\\`
- 分号 → `\x3b`
- ASCII 码 <0x20 的控制字符 → `\xXX`

当字符串长度 ≥2000 时自动切换为快速模式 (仅处理反斜杠和分号)。

**类型:** `(input: string) => string`
