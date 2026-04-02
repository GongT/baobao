<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## environment/npmConfig

读取 npm 配置值

##### getNpmConfigValue

获取 npm 配置项的值

- `field`: 配置项名称
- 返回: `Promise<string>` — 配置值; 未找到时返回空字符串

优先从 `npm_config_*` 环境变量中读取(自动转换为 linux_case 格式), 回退到执行 `npm config get` 命令
