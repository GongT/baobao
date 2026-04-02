<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### humanReadable

表示人类可读错误信息方法的 Symbol。

**类型:** `symbol`

---

##### IHumanReadable

表示对象可提供人类可读错误信息的接口。

```typescript
interface IHumanReadable {
  [humanReadable](): string;
}
```

---

##### isHumanReadable

判断值是否实现了 `IHumanReadable` 接口。

**类型:** `(error: unknown) => error is IHumanReadable`
