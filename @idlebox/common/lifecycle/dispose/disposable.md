<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### IDisposable

最基本的同步 disposable 接口。

```typescript
interface IDisposable {
  dispose(): void;
}
```

---

##### IAsyncDisposable

支持异步释放的 disposable 接口。

```typescript
interface IAsyncDisposable {
  dispose(): void | Promise<void>;
}
```

---

##### AbstractEnhancedDisposable

增强型 Disposable 抽象基类，提供完整的资源管理基础设施。

**类型:** `abstract class AbstractEnhancedDisposable<Async extends boolean>`

成员:

| 成员 | 类型 | 说明 |
|---|---|---|
| `disposed` | `boolean` | 是否已完成 dispose |
| `disposing` | `boolean` | 是否正在 dispose 中 |
| `displayName` | `string?` | 调试用名称 |
| `onDisposeError` | `EventRegister<Error>` | dispose 中发生错误时的事件 |
| `onBeforeDispose` | `EventRegister<void>` | 即将 dispose 时的事件 |
| `onPostDispose` | `EventRegister<void>` | dispose 完成后的事件 |
| `dispose()` | `() => void \| Promise<void>` | 释放所有资源 |
| `_register(d)` | `(d) => d` | 注册子资源，返回同一对象 |
| `_unregister(d)` | `(d) => boolean` | 取消注册子资源 |
| `assertNotDisposed()` | `() => void` | 断言尚未 dispose |

---

##### DuplicateDisposeAction

重复 dispose 时的行为枚举:

| 值 | 行为 |
|---|---|
| `Disable` (0) | 抛出错误 |
| `Warning` (1) | 打印警告 (默认) |
| `Allow` (2) | 允许重复，返回同一结果 |
