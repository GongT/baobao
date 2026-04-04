<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## 增强型 Disposable 基础设施

提供带生命周期管理、事件通知、重复 dispose 保护的可销毁对象基类。

#### DuplicateDisposeAction

控制重复调用 `dispose()` 时的行为。

```typescript
enum DuplicateDisposeAction {
  Disable = 0,  // 抛出错误
  Warning = 1,  // 打印警告（默认）
  Allow = 2,    // 允许重复调用，直接返回
}
```

#### IDisposable

同步可销毁对象的接口。

```typescript
interface IDisposable {
  dispose(): void;
}
```

#### IAsyncDisposable

异步可销毁对象的接口，`dispose()` 可返回 Promise。

```typescript
interface IAsyncDisposable {
  dispose(): void | Promise<void>;
}
```

#### IDisposableEvents

具有生命周期事件的 Disposable 接口。

```typescript
interface IDisposableEvents {
  readonly onBeforeDispose: EventRegister<void>;
  readonly onDisposeError: EventRegister<Error>;
  readonly onPostDispose: EventRegister<void>;
  readonly disposed: boolean;
}
```

#### AbstractEnhancedDisposable

增强型 Disposable 抽象基类，同时实现 `IDisposableEvents`。

支持同步和异步两种模式（由泛型参数 `Async extends boolean` 控制）。

##### constructor

```typescript
new AbstractEnhancedDisposable<Async>(displayName?: string);
```

`displayName` 用于调试日志，不传时自动从类名推断。

| 成员 | 类型 | 说明 |
|------|------|------|
| `displayName` | `string \| undefined` | 调试用名称 |
| `disposed` | `boolean` | 是否已完成 dispose |
| `disposing` | `boolean` | 是否正在 dispose 中（已开始但未完成）|
| `onBeforeDispose` | `EventRegister<void>` | dispose 开始前触发 |
| `onDisposeError` | `EventRegister<Error>` | dispose 抛出异常时触发 |
| `onPostDispose` | `EventRegister<void>` | dispose 完成后触发 |
| `dispose()` | `void \| Promise<void>` | 销毁此对象及其注册的子 disposable |
| `assertNotDisposed()` | `void` | 断言未被 dispose，否则抛出 `DuplicateDisposedError` |
| `_register(d)` | `T` | 注册子 disposable，dispose 时自动销毁 |
| `_unregister(d)` | `boolean` | 取消注册子 disposable |
| `duplicateDispose` | `DuplicateDisposeAction` | (protected) 重复 dispose 行为，默认 `Warning` |
| `_dispose(disposables)` | `void \| Promise<void>` | (protected abstract) 子类实现的销毁逻辑 |

**示例**
```typescript
class MyService extends EnhancedDisposable {
  private readonly timer = this._register(new SomeDisposable());
}
const svc = new MyService();
svc.onBeforeDispose(() => console.log('即将销毁'));
svc.dispose();
```

#### dumpDisposableStack

将 Disposable 树结构打印到 `console.error`，用于调试。

```typescript
function dumpDisposableStack(disposable: AbstractEnhancedDisposable<any>): void;
```
