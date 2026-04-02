<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

package.json 文件的类型定义和解析工具

##### IPackageJson

`interface` - 完整的 package.json 类型定义, 包含所有标准字段及一些自定义扩展字段

常用字段: `name`, `version`, `main`, `module`, `exports`, `dependencies`, `devDependencies` 等

自定义扩展字段:
- `decoupledDependencies`: 构建顺序解析时需要移除的依赖列表
- `decoupledDependents`: 将当前包加入指定包的 `decoupledDependencies` 列表
- `additionalDependencies`: 构建顺序解析时额外添加的 `devDependencies`
- `llms` / `llmsFull`: LLM 相关描述字段

##### IPackageJsonNpmDist

`interface` - npm registry 返回的 `dist` 字段类型, 包含 `integrity`, `shasum`, `tarball`, `fileCount`, `unpackedSize`, `signatures`, `size`

##### IExportCondition

`interface` - package.json `exports` 字段中的条件导出对象

支持的条件: `node`, `node-addons`, `browser`, `require`, `import`, `types`, `default` 及自定义平台

##### IExportMap

`interface` - 路径映射形式的 exports, key 为以 `.` 开头的导出路径

##### IFullExportsField

`interface` - 标准化后的完整 exports 字段, 所有路径均映射到 `IExportCondition`

##### IExportsField

`type` = `string | IExportCondition | IExportMap`

exports 字段的所有可能类型

##### IImportsField

`type` = `IExportCondition | IExportMap`

imports 字段的所有可能类型

##### parseExportsField

解析 package.json 的 `exports` 字段为标准化的 `IFullExportsField` 格式

- `exports`: `IExportsField` - 原始 exports 字段值
- 返回: `IFullExportsField` - 标准化后的路径到条件导出的映射

```typescript
// 字符串形式
parseExportsField('./index.js')
// => { '.': { default: './index.js' } }

// 条件导出形式
parseExportsField({ import: './index.mjs', require: './index.cjs' })
// => { '.': { import: './index.mjs', require: './index.cjs' } }

// 路径映射形式
parseExportsField({ '.': './index.js', './utils': './utils.js' })
// => { '.': { default: './index.js' }, './utils': { default: './utils.js' } }
```

##### resolveExportPath

根据给定的条件列表解析导出路径

- `exportField`: `string | IExportCondition` - 单个导出条件对象或字符串
- `condition`: `readonly string[]` - 条件优先级列表(如 `['import', 'default']`)
- 返回: `string | undefined` - 解析后的文件路径, 无匹配则返回 `undefined`

```typescript
resolveExportPath({ import: './index.mjs', require: './index.cjs' }, ['import', 'default'])
// => './index.mjs'
```
