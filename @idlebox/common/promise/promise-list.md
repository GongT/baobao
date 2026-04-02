<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### PromiseCollection

管理一组以字符串 ID 索引的 DeferredPromise 集合。

**类型:** `class PromiseCollection`

成员:

| 成员 | 说明 |
|---|---|
| `create(id)` | 创建 Promise，返回其 `p`；若 id 已存在则抛错 |
| `has(id)` | 是否存在 |
| `done(id, data)` | resolve 指定 id 的 Promise 并删除 |
| `error(id, e)` | reject 指定 id 的 Promise 并删除 |
| `dispose()` | 以 `CanceledError` reject 所有待处理 Promise |
| `size()` | 返回待处理数量 |
