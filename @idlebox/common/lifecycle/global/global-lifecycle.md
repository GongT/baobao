<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### registerGlobalLifecycle

将对象注册到全局 disposable 容器，在 `disposeGlobal()` 时统一释放。

**类型:** `(object: IDisposable | IAsyncDisposable, autoDereference?: boolean) => void`

**参数:**
- `object` — 要注册的 disposable 对象
- `autoDereference` — 若对象 dispose 时自动从全局容器中注销

---

##### disposeGlobal

释放全局 disposable 容器。需要用户手动调用。重复调用会抛出错误，可使用 `ensureDisposeGlobal()` 代替。

**类型:** `() => Promise<void>`

---

##### ensureDisposeGlobal

与 `disposeGlobal` 相同，但重复调用不会抛错。

**类型:** `() => Promise<void>`
