<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## path-resolve/resolvePath

跨平台路径解析工具(Windows上统一使用正斜杠)

##### ResolvePathFunction

类型: `(...pathSegments: string[]) => string`

##### JoinPathFunction

类型: `(from: string, to: string) => string`

##### NormalizePathFunction

类型: `(path: string) => string`

##### resolvePath

跨平台的 `path.resolve`, Windows 上自动将反斜杠转为正斜杠

##### normalizePath

跨平台的 `path.normalize`, Windows 上自动将反斜杠转为正斜杠

##### relativePath

跨平台的 `path.relative`, Windows 上自动将反斜杠转为正斜杠

##### osTempDir

获取系统临时目录路径

- `name`: 可选子目录名
- 返回: `string` — 临时目录的绝对路径; 传入 `name` 时返回临时目录下的子路径
