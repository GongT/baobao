<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### NotError

表示"没有错误"的特殊对象，用于通过 try/catch 接口传递非错误分支。

**类型:** `class NotError implements IHumanReadable`

构造函数: `constructor(extra_message?: string)`

注意: 此对象不是真正的 `Error`，访问其 `stack` 或 `message` 属性会抛出错误，提示开发者未正确捕获。
