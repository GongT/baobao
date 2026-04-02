<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## log/terminal

终端彩色日志控制台

##### WrappedTerminalConsole

继承自 `WrappedConsole`(@idlebox/common), 为终端环境添加 ANSI 颜色支持

构造函数:
- `title`: 日志标题前缀
- `options`: 可选配置
  - `color`: 颜色配置
    - `false`: 禁用颜色
    - `undefined`(默认): 仅在 stdout 和 stderr 都是 TTY 时启用颜色
    - `Partial<colorMap>`: 自定义各级别的 ANSI 颜色代码

默认颜色映射:

| 级别 | ANSI 代码 | 效果 |
|------|----------|------|
| info | `38;5;14` | 青色 |
| success | `38;5;10` | 绿色 |
| debug | `2` | 暗色 |
| error | `38;5;9` | 红色 |
| trace | `2` | 暗色 |
| warn | `38;5;11` | 黄色 |
| assert | `38;5;9;7` | 红色反显 |
