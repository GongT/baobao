<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### hasProcess / hasWindow / hasGlobal

运行环境检测布尔值:
- `hasProcess` — 是否有真实的 `process.pid` (Node.js)
- `hasWindow` — 是否在浏览器顶层 window
- `hasGlobal` — 是否在 Node.js global

##### isElectron / isElectronRenderer / isElectronMain / isElectronSandbox

Electron 环境检测布尔值。

##### isWindows / isMacintosh / isLinux / isNative / isNodeJs / isWeb / is64Bit / is32Bit

操作系统和平台检测布尔值。在 Node.js 下基于 `process.platform` 和 `process.arch` 检测，在浏览器下基于 `navigator.userAgent` 检测。

##### isV8

是否运行在 V8 引擎上 (支持 `Error.captureStackTrace` 或堆栈包含 ` at ` 格式)。

**类型:** `boolean`

##### sepList

当前平台的 PATH 分隔符: Windows 为 `;`，其他为 `:`。

**类型:** `string`
