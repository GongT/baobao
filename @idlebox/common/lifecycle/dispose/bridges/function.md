<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### functionToDisposable

将一个 "释放函数" 包装为 `IDisposable` 或 `IAsyncDisposable` 对象。

**类型:** `<RT>(fn: () => RT) => RT extends Promise<any> ? IAsyncDisposable : IDisposable`

**参数:**
- `fn` — dispose 时调用的函数，若返回 `Promise` 则包装为 `IAsyncDisposable`

---

##### disposerFunction

将 `IDisposable`/`IAsyncDisposable` 对象转换为普通函数，便于在 React `useEffect` 等场景使用。

**类型:** `<T extends IDisposable | IAsyncDisposable>(obj: T) => T extends IAsyncDisposable ? () => Promise<void> : () => void`

**示例:**
```typescript
useEffect(() => {
  const d = new MyResource();
  return disposerFunction(d); // () => void
}, []);
```
