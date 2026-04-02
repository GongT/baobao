<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## path-resolve/lrelative

计算相对路径(始终使用正斜杠)

##### lrelative

计算从 `from` 到 `to` 的相对路径, 结果始终使用 `/` 分隔符

- `from`: 起始绝对路径
- `to`: 目标绝对路径
- 返回: `string` — 相对路径(如 `'../../foo/bar'` 或 `'./foo'`)
- 两个参数都必须是绝对路径, 否则抛出错误
