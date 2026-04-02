<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### getRootCause

递归沿 `cause` 链向下，返回最终根因错误。

**类型:** `(e: Error) => Error`

---

##### getCauseStack

返回从 `e` 开始的完整 cause 链数组，顺序为从外到内。

**类型:** `(e: Error) => Error[]`
