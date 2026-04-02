<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### promiseBool

将 Promise 转换为返回布尔值的 Promise: resolve 时返回 `true`，reject 时丢弃错误并返回 `false`。

**类型:** `(p: Promise<any>) => Promise<boolean>`
