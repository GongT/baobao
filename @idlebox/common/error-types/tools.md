<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### CanceledError

表示操作被主动取消时的错误。

**类型:** `class CanceledError extends ErrorWithCode implements IHumanReadable`

构造函数: `constructor(opts?: IErrorOptions)`

**静态方法:**
- `CanceledError.is(e)` — 判断是否为 `CanceledError`

---

##### TimeoutError

表示某种操作超时的错误。

**类型:** `class TimeoutError extends ErrorWithCode implements IHumanReadable`

构造函数: `constructor(ms: number, why?: string, opts?: IErrorOptions & { what?: string })`

- `ms` — 超时毫秒数
- `why` — 超时原因描述，默认 `'no response'`
- `opts.what` — 正在做什么操作 (出现在错误消息中)

**静态方法:**
- `TimeoutError.is(error)` — 判断是否为 `TimeoutError`
