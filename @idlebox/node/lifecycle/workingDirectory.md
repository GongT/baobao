<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## lifecycle/workingDirectory

VSCode Shell Integration 兼容的工作目录管理

##### workingDirectory

只读对象, 提供工作目录相关操作, 在 VSCode 终端集成环境下自动发送目录变更的转义序列

| 成员 | 类型 | 说明 |
|------|------|------|
| cwd() | `() => string` | 获取当前工作目录 |
| chdir(dir) | `(dir: string) => void` | 切换工作目录 |
| patchGlobal() | `() => void` | 将修改后的chdir注入到全局process |
| escapeVscodeCwd | `(path: string) => string` | 生成VSCode Shell Integration转义序列 |
| isVscodeShellIntegration | `boolean` | 当前是否在VSCode终端集成环境中 |

在非 VSCode 环境下, `cwd()` 和 `chdir()` 等同于 `process.cwd()` / `process.chdir()`; 在 VSCode 环境下, `chdir()` 会额外向 stderr 写入 OSC 633 转义序列通知 VSCode 目录变化
