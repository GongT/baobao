<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### scheduler

跨平台的微任务调度函数。在 Node.js 中使用 `process.nextTick`，在浏览器中使用 `queueMicrotask` (回退到 `setTimeout`)。

**类型:** `(task: Function) => void`
