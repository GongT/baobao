<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## path-resolve/nodeResolvePathArray

生成 Node.js 模块解析路径数组

##### nodeResolvePathArray

从指定目录开始, 向上生成每一级目录下的 `node_modules`(或自定义子目录)路径

- `from`: 起始目录
- `file`: 要附加的子目录名, 默认 `'node_modules'`
- 返回: `string[]` — 从 `from` 到根目录的所有路径

```typescript
nodeResolvePathArray('/a/b/c');
// ['/a/b/c/node_modules', '/a/b/node_modules', '/a/node_modules']
```
