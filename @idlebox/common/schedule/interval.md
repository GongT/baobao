<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### interval

创建一个 `setInterval` 定时器，返回可 dispose 的对象。

**类型:** `(ms: number, action: () => void, unref?: boolean) => IDisposable`

**参数:**
- `ms` — 间隔毫秒数
- `action` — 定时回调
- `unref` — 仅 Node.js，是否调用 `.unref()`，默认 `false`

---

##### Interval

可暂停/恢复的定时器类，继承自 `EnhancedDisposable`。

**类型:** `class Interval extends EnhancedDisposable`

构造函数: `constructor(ms: number, unref?: boolean)`

成员:

| 成员 | 说明 |
|---|---|
| `onTick` | `EventRegister<void>` 事件，每次定时触发 |
| `resume()` | 开始计时 |
| `pause()` | 暂停计时 |
| `reset()` | 重新启动计时 |
| `fire()` | 立即触发一次 onTick |
