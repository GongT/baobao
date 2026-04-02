<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### ExtendableTimer

可反复推迟触发时间的定时器，类似"防抖"场景。

**类型:** `class ExtendableTimer implements IDisposable`

构造函数: `constructor(durationMs: number)`

成员:

| 成员 | 说明 |
|---|---|
| `start()` | 启动定时器；若已在计时则重置计时 |
| `renew()` | 重置计时 (仅在运行中有效) |
| `cancel()` | 取消定时器，Promise 以 `CanceledError` reject |
| `p` | 等待触发的 Promise |
| `onSchedule` | `p.then.bind(p)` 的快捷方式 |
| `dispose` | 同 `cancel` |

**示例:**
```typescript
const timer = new ExtendableTimer(500);
timer.start();
// 每次输入重新延迟
input.on('change', () => timer.renew());
await timer.p; // 500ms 无输入后触发
```
