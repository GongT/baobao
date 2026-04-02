<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

Promise 竞争工具: 返回第一个成功的结果

##### raceFirstSuccess

类似 `Promise.any`, 返回第一个成功 resolve 的 Promise 的值; 若全部失败则 reject 一个 `AggregateError`

- `promises`: `PromiseLike<T>[]` - 要竞争的 Promise 数组
- 返回: `Promise<T>` - 第一个成功的结果

```typescript
const result = await raceFirstSuccess([
  fetch('https://mirror1.example.com/data'),
  fetch('https://mirror2.example.com/data'),
]);
```
