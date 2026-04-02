<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### EventHandler

事件回调函数类型: `(data: T) => void`

---

##### EventRegister

事件注册函数接口 (所有方法均已 bind):

```typescript
interface EventRegister<T> {
  (callback: EventHandler<T>): IDisposable;
  once(callback: EventHandler<T>): IDisposable;
  wait(): IDisposable;
  readonly disposed: boolean;
}
```

---

##### IEventEmitter

完整的事件发射器接口，包含 `fire`、`handle`、`once`、`wait`、`listenerCount`、`disposed` 等成员。

---

##### EventEmitterMap

将类型映射转换为 Emitter map 类型: `{ [K in keyof T]: Emitter<T[K]> }`
