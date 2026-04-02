<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### awaitIterator

将 `Iterator` 转换为 `Promise`，resolve 时返回迭代器的最后一个值。

对每个 yield 值，若它是 `Promise` 则 await；若是可迭代对象则递归处理；否则直接保留。

**类型:** `<T>(generator: Iterator<T>) => Promise<T>`
