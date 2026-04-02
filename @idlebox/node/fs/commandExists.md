<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## fs/commandExists

检查命令是否存在于 PATH 中

##### commandInPath

异步检查指定命令是否存在于系统 PATH 中(检查可执行权限)

- `cmd`: 命令名
- `alterExt`: 可选的文件扩展名数组; 未指定时 Windows 上自动尝试 `.exe`, `.bat`, `.cmd`, `.com`, `.ps1`
- 返回: `Promise<string | undefined>` — 找到时返回完整路径, 未找到返回 `undefined`

##### commandInPathSync

`commandInPath` 的同步版本

- `cmd`: 命令名
- `alterExt`: 可选的文件扩展名数组
- 返回: `string | undefined`
