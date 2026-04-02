<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

超时与延时相关工具

##### timeout

创建一个在指定时间后 reject `TimeoutError` 的 Promise

- `ms`: `number` - 超时毫秒数
- `error`?: `string` - 错误消息(默认 `'no response'`)
- `boundary`?: `Function` - 用于清理调用栈的边界函数
- `unref`?: `boolean` - 是否调用 timer 的 `unref()`(默认 `false`; 非 Node.js 环境设为 `true` 会报错)
- 返回: `Promise<never>` - 超时后 reject

##### sleep

创建一个在指定时间后 resolve 的 Promise

- `ms`: `number` - 延时毫秒数
- `unref`?: `boolean` - 是否调用 timer 的 `unref()`(默认 `false`)
- 返回: `Promise<void>`

```typescript
await sleep(1000); // 等待1秒
```

##### raceTimeout

将一个 Promise 与超时竞争, 超时则 reject `TimeoutError`

- `ms`: `number` - 超时毫秒数
- `message`?: `string` - 超时错误消息
- `p`: `PromiseLike<T>` - 要竞争的 Promise
- 返回: `Promise<T>`

```typescript
const data = await raceTimeout(5000, '请求超时', fetchData());
```

##### raceTimeoutWithRetry

带重试的超时竞争; 每次超时后会再次调用 factory 创建新 Promise, 同时之前的请求仍在运行(并行竞争)

注意: 多次重试会并行, 如果之前的请求突然成功, 后续重试的结果会被丢弃; 建议用于幂等请求

- `ms`: `number` - 每次尝试的超时毫秒数
- `retry`: `number` - 最大尝试次数
- `factory`: `() => Promise<T>` - 创建请求的工厂函数
- 返回: `Promise<T>` - 第一个在超时内完成的结果

```typescript
const data = await raceTimeoutWithRetry(3000, 3, () => fetch(url).then(r => r.json()));
```
