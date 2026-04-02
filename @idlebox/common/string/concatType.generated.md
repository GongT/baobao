<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

类型安全的字符串拼接函数(生成文件)

##### concatStringType

将多个字符串字面量类型参数拼接为模板字面量类型; 支持 1-20 个参数

- `...args`: `string[]` - 要拼接的字符串(每个参数为 `extends string` 的泛型)
- 返回: 模板字面量类型 `` `${T0}${T1}...` ``

```typescript
const result = concatStringType('hello', '-', 'world');
// 类型为 'hello-world', 值也是 'hello-world'
```
