<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### isProductionMode

是否为生产模式。读取 `import.meta.env?.MODE === 'production'`，需要编译工具支持 define replacement (如 Vite 无需额外配置)。

**类型:** `boolean`

---

##### isBuildMode

是否为构建模式。读取 `import.meta.env?.PROD`。

**类型:** `boolean`
