<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### MemorizedEmitter

记忆上次 `fire()` 的数据，每次新监听器注册时立即以记忆的数据调用一次。继承自 `Emitter<T>`。

注意: 不支持 `once()` 方法 (会抛出错误)。

**类型:** `class MemorizedEmitter<T> extends Emitter<T>`

额外成员:

| 成员 | 说明 |
|---|---|
| `forget()` | 清除记忆的数据 |
