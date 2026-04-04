<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## retryFetch

带超时和自动重试的 `fetch` 封装，在请求超时时自动重试，遇到其他错误直接抛出。

```typescript
async function retryFetch(
  url: string,
  options: IRetryOptions
): Promise<Response>;
```

**参数说明**
- `retries` — 最大重试次数，默认 `3`
- `delay` — 每次重试之间的等待时间（毫秒），默认 `800`
- `timeout` — 单次请求超时时间（毫秒），默认 `3500`
- `signal` — 外部 `AbortSignal`，中止时传播给内部请求
- 其余参数与标准 `fetch` 的 `RequestInit` 相同

**特殊说明**
只有 `TimeoutError` 才会触发重试，其他类型的错误立即抛出。超出重试次数后抛出错误。
