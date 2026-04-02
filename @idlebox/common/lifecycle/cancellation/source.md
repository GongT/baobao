<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### CancellationToken

取消令牌接口，只读。

| 成员 | 说明 |
|---|---|
| `isCancellationRequested` | 是否已请求取消 |
| `onCancellationRequested(callback)` | 注册取消回调，返回 `IDisposable` |

---

##### CancellationTokenSource

取消令牌的控制端。继承自 `DisposableOnce`。创建后通过 `.token` 属性分发给消费者，调用 `.cancel()` 触发取消，`.dispose()` 自动取消并清理。

**类型:** `class CancellationTokenSource extends DisposableOnce`

成员:

| 成员 | 说明 |
|---|---|
| `token` | 只读的 `CancellationToken` |
| `cancel()` | 触发取消 |
| `dispose()` | 取消并释放资源 |

**示例:**
```typescript
const source = new CancellationTokenSource();
doWork(source.token);
// 需要取消时:
source.cancel();
```
