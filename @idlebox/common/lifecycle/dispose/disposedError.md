<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### DuplicateDisposedError

当对象被重复 dispose 时抛出的错误，继承自 `DisposedError`。

**类型:** `class DuplicateDisposedError extends DisposedError`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `object` | `any` | 被重复 dispose 的对象 |
| `consoleWarning()` | `() => void` | 在控制台打印彩色警告信息 |
| `previous` | `StackTraceHolder` | 第一次 dispose 时的 stack |
