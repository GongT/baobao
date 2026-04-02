<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### WrappedConsole

带标题前缀的 Console 抽象基类。所有标准 Console 方法均已重写，输出时自动添加 `[title]` 前缀。

**类型:** `abstract class WrappedConsole`

构造函数: `constructor(title: string, options?: WrappedConsoleOptions)`

- `options.parent` — 代理的原始 console 对象，默认 `console`
- `options.bind` — 是否 bind 原始方法，默认 `false`

支持 `info`、`log`、`debug`、`error`、`warn`、`trace`、`assert`、`time`、`timeEnd` 等标准方法。

继承此类需实现 `processColorLabel(args, messageLoc, level, prefix)` 方法以控制颜色/前缀格式。

---

##### ColorKind

颜色模式枚举:

| 值 | 说明 |
|---|---|
| `DISABLE` (0) | 禁用颜色 |
| `TERMINAL` (1) | 终端 ANSI 颜色 |
| `WEB` (2) | 浏览器 console 颜色 |
| `DETECT` (3) | 自动检测 |
