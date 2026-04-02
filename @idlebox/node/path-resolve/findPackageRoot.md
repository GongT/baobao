<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## path-resolve/findPackageRoot

查找npm包的根目录

##### findPackageRoot

通过 `require.resolve` 定位指定 npm 包的根目录(包含 `package.json` 的目录)

- `packageName`: 包名(如 `'lodash'`, `'@scope/pkg'`)
- `require`: 可选, 自定义的 `require` 函数; 默认使用 `createRequire(process.cwd())`
- 返回: `string` — 包根目录的绝对路径

当包的 `package.json` 未在 exports 中导出时, 会通过 `findUpUntilSync` 从包的入口文件向上搜索
