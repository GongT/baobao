<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### inspectSymbol

Node.js 自定义 inspect 方法的 Symbol，值为 `Symbol.for('nodejs.util.inspect.custom')`。

**类型:** `symbol`

---

##### defineInspectMethod

为对象定义自定义 inspect 方法 (私有、不可枚举)。

**类型:** `<T>(obj: T, method: (this: T, depth: number, context: any, inspect: Function) => string) => T`

**参数:**
- `obj` — 目标对象
- `method` — inspect 回调函数

**返回:** 同一对象 (`obj`)

---

##### tryInspect

尝试将对象转换为可读字符串。优先使用 Node.js 的 `util.inspect`；若不可用，则依次尝试 `[inspectSymbol]`、`.inspect()`、`Symbol.toStringTag`、`.toJSON()`；最后回退到构造函数名。

**类型:** `(object: any) => string`
