<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## path-resolve/getAllUp

生成从根到目标的所有路径

##### getAllPathUpToRoot

将路径拆分为各级目录, 从根开始逐级拼接生成路径数组

- `from`: 要拆分的路径
- `append`: 可选, 每个路径后附加的子路径
- 返回: `string[]`

```typescript
getAllPathUpToRoot('/a/b/c');
// ['/a', '/a/b', '/a/b/c']

getAllPathUpToRoot('/a/b/c', 'node_modules');
// ['/a/node_modules', '/a/b/node_modules', '/a/b/c/node_modules']
```
