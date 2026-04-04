<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## TimeoutStorage

带过期时间的 localStorage 存储封装。存储的数据在到达过期时间后自动视为不存在。

```typescript
class TimeoutStorage<T> {
  constructor(key: string, storage?: Storage);
}
```

默认使用 `localStorage`，可传入其他 `Storage` 实例（如 `sessionStorage`）。

| 成员 | 说明 |
|------|------|
| `save(data, expire)` | 保存数据，`expire` 可为 `Date` 对象或 UTC 日期字符串 |
| `read()` | 读取未过期的数据，过期或不存在时返回 `undefined` |
| `read(defaultVal)` | 读取未过期的数据，过期或不存在时返回默认值 |
| `getExpire()` | 获取过期时间（`Date`），已过期时返回 `null` 并清除数据 |
| `forget()` | 删除存储的值（保留过期时间键）|

**示例**
```typescript
const cache = new TimeoutStorage<string>('my-key');
cache.save('hello', new Date(Date.now() + 60000)); // 缓存1分钟
cache.read('default'); // 返回 'hello'
```
