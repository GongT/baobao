<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### createStackTraceHolder

创建一个保存当前调用堆栈的对象，用于后续调试或错误追踪。仅在 V8 引擎下有完整效果；非 V8 环境会打印警告并回退到标准 `Error`。

**类型:** `(message: string, boundary?: any) => StackTraceHolder`

**参数:**
- `message` — 堆栈标记信息
- `boundary` — stack trace 的边界函数，该函数及其以上帧会从 stack 中排除

**返回:** `StackTraceHolder` 对象:

| 成员 | 说明 |
|---|---|
| `message` | 构造时传入的消息 |
| `stack` | 完整堆栈字符串 |
| `stackOnly` | 去掉第一行 (消息行) 的堆栈 |
| `name` | 可设置的名称 |
