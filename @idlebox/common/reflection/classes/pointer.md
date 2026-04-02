<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### Pointer

创建一个透明 Proxy，所有操作代理到 `ref.reference` 所指向的对象上。当 `reference` 改变时，Proxy 会自动指向新的目标。

**类型:** `<T>(ref: Ref<T>) => T`

**参数:**
- `ref` — 包含 `reference` 属性的容器对象

**示例:**
```typescript
const ref = { reference: myService };
const proxy = Pointer(ref);
// 使用 proxy 时等同于使用 myService
ref.reference = newService; // proxy 自动切换目标
```
