<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### IPackageJson

`package.json` 文件结构的完整类型定义接口，覆盖所有标准字段及自定义扩展字段。

**类型:** `interface IPackageJson`

包含: `name`、`version`、`main`、`exports`、`dependencies`、`scripts` 等标准 npm 字段。

自定义扩展字段:
- `decoupledDependencies` — 构建顺序解析时忽略的依赖
- `decoupledDependents` — 把本包加入其 `decoupledDependencies` 的包名列表
- `additionalDependencies` — 构建顺序解析时额外的 devDependencies

---

##### IPackageJsonNpmDist

npm registry 下载包时附带的 `dist` 字段类型定义。

---

##### parseExportsField

解析 `package.json` 的 `exports` 字段，返回规范化后的 `IFullExportsField` (所有路径都有显式条件对象)。

**类型:** `(exports: IExportsField) => IFullExportsField`

---

##### resolveExportPath

根据条件列表解析 `exports` 中的某个条件路径。

**类型:** `(exportField: string | IExportCondition, condition: readonly string[]) => string | undefined`
