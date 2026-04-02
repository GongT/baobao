<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## events/dumpEventEmitter

调试工具: 拦截 EventEmitter 的 emit 调用

##### dumpEventEmitterEmit

替换 EventEmitter 的 `emit` 方法, 在每次触发事件时通过 `console.log` 输出事件名和参数

- `ev`: 要拦截的 EventEmitter 实例
