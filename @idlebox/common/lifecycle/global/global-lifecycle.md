<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## 全局生命周期管理

提供应用级全局 Disposable 容器，统一管理需要在应用退出时销毁的资源。

#### registerGlobalLifecycle

将对象注册到全局 Disposable 容器，应用退出时（调用 `disposeGlobal`）自动销毁。

```typescript
function registerGlobalLifecycle(object: IDisposable | IAsyncDisposable): void;
function registerGlobalLifecycle(
  object: (IDisposable | IAsyncDisposable) & IDisposableEvents,
  autoDereference: true
): void;
```

**参数说明**
当 `autoDereference` 为 `true` 时，对象自身 dispose 后会自动从全局容器中移除，需要对象同时实现 `IDisposableEvents`。

#### disposeGlobal

销毁全局 Disposable 容器中的所有注册对象。

```typescript
function disposeGlobal(): Promise<void>;
```

**特殊说明**
重复调用会抛出错误。如需安全调用请使用 `ensureDisposeGlobal`。

#### ensureDisposeGlobal

与 `disposeGlobal` 相同，但重复调用不抛出错误。

```typescript
function ensureDisposeGlobal(): Promise<void>;
```
