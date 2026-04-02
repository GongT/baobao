<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### IErrorOptions

自定义错误构造选项接口:

| 字段 | 类型 | 说明 |
|---|---|---|
| `boundary` | `CallableFunction?` | stack trace 边界函数 |
| `cause` | `unknown?` | 错误的 cause |
| `stack` | `string?` | 替换 stack 字符串 |
