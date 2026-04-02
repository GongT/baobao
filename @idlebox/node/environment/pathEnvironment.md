<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## environment/pathEnvironment

PATH 环境变量管理

##### PATH_SEPARATOR

PATH 环境变量的分隔符: Windows 上为 `';'`, 其他平台为 `':'`

##### PathEnvironment

继承自 `PathArray`(@idlebox/common), 直接操作 `process.env` 中的 PATH 变量

构造函数:
- `varName`: 环境变量名, 默认 Windows 为 `'Path'`, 其他为 `'PATH'`
- `env`: 环境变量对象, 默认 `process.env`

初始化时自动读取当前 PATH 值并清理重复的大小写变体

| 成员 | 类型 | 说明 |
|------|------|------|
| add(p) | `(p: string) => this` | 添加路径, 自动同步到环境变量 |
| delete(p) | `(p: string) => boolean` | 删除路径, 自动同步到环境变量 |
| clear() | `() => void` | 清空所有路径, 自动同步到环境变量 |
| save() | `() => void` | 手动将当前内容写回环境变量 |
