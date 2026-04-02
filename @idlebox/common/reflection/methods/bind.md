<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### bindThis

方法装饰器，将方法自动 bind 到实例。需要 TC39 Stage 3 装饰器支持。

**类型:** `(method: Function, context: ClassMethodDecoratorContext) => Function | undefined`

仅适用于实例方法 (非静态、非私有时使用 `addInitializer`，私有方法直接包装)。

**示例:**
```typescript
class Foo {
  @bindThis
  handleClick() { /* this 始终是实例 */ }
}
```
