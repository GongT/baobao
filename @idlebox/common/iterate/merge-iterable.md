<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### mergeIterables

将多个可迭代对象顺序合并为一个生成器 (先遍历第一个，再第二个，以此类推)。

**类型:** `<T>(...iterables: Iterable<T>[]) => Generator<T>`

---

##### joinAsyncIterables

与 `mergeIterables` 相同，但支持异步可迭代对象，返回 `AsyncGenerator`。

**类型:** `<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) => AsyncGenerator<T>`

---

##### interleaveIterables

将多个可迭代对象交错合并 (轮流从每个迭代器取一个元素)。

**类型:** `<T>(...iterables: Iterable<T>[]) => Generator<T>`

---

##### interleaveAsyncIterables

与 `interleaveIterables` 相同，但支持异步可迭代对象。

**类型:** `<T>(...iterables: (Iterable<T> | AsyncIterable<T>)[]) => AsyncGenerator<T>`
