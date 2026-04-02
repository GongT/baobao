<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### DisposableOnce

简单版手动 disposable 抽象类，防止重复 dispose。

**类型:** `abstract class DisposableOnce implements IDisposable`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `disposed` | `boolean` | 是否已 dispose |
| `dispose()` | `() => void` | 调用一次；重复调用仅打印警告 |

需要继承并实现 `_dispose()` 方法。

---

##### EnhancedDisposable

完整版同步 Disposable 类，继承自 `AbstractEnhancedDisposable<false>`。可继承或直接用作资源容器。

实现了 `[Symbol.dispose]`，兼容 `using` 语法。参见 `AbstractEnhancedDisposable` 的成员文档。
