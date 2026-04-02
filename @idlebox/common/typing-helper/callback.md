<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### ICommonCallback

Node.js 风格的回调函数接口，支持错误优先模式。

```typescript
interface ICommonCallback<T> {
  (error: null | undefined, data: T): void;
  (error: Error): void;
}
```
