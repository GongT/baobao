<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## environment/getEnvironment

大小写不敏感的环境变量操作

##### IEnvironmentResult

环境变量查询结果: `{ value: string | undefined; name: string }`

##### getEnvironment

大小写不敏感地获取环境变量

- `name`: 变量名
- `env`: 环境变量对象, 默认 `process.env`
- 返回: `IEnvironmentResult` — 包含实际的变量名和值; 优先精确匹配, 其次忽略大小写匹配

##### deleteEnvironment

大小写不敏感地删除环境变量(删除所有匹配的变体)

- `name`: 变量名
- `env`: 环境变量对象, 默认 `process.env`

##### cleanupEnvironment

清理环境变量的重复大小写变体, 保留一个实例

- `name`: 变量名
- `env`: 环境变量对象, 默认 `process.env`

优先保留精确匹配名称的变量; 如果没有精确匹配则保留第一个找到的
