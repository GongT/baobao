<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## path-resolve/findUp

向上级目录逐层搜索文件

##### IFindOptions

搜索选项:

- `from`: 起始目录, 必须是绝对路径
- `file`: 要查找的文件名, 或文件名数组
- `top`: 可选, 搜索的最外层目录; 超出范围停止搜索
- `resolveSymlink`: 可选, 为 `false` 时使用 `join` 而非 `resolve`(不解析符号链接)

##### findUpUntil

异步向上搜索, 返回第一个匹配的文件路径

- `opts`: `IFindOptions`
- 返回: `Promise<string | null>` — 找到时返回绝对路径, 未找到返回 `null`

##### findUp

异步向上搜索, 以异步迭代器形式返回所有匹配的文件路径

- `opts`: `IFindOptions`
- 返回: `AsyncIterableIterator<string>`

##### findUpUntilSync

`findUpUntil` 的同步版本

- `opts`: `IFindOptions`
- 返回: `string | null`

##### findUpSync

同步向上搜索, 返回所有匹配的文件路径数组

- `opts`: `IFindOptions`
- 返回: `string[]`
