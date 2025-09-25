# Vite chunks 手动拆分依赖包的插件

指定的依赖包**和它的依赖**会被拆分到单独的chunk中。

**目前仅支持pnpm monorepo**

### 使用

更多参数参考代码: [src/index.ts](./src/index.ts)

```ts
import { splitVendorPlugin } from "@build-script/vite-plugin-chunk-tree";

export default defineConfig(async (config) => {

	return {
		plugins: [
			splitVendorPlugin({
				internalChunk: '_lib',
				
				chunks: [
					{ name: "react", packages: ["react", "react-dom", "react-router"] },
					{ name: "antd", packages: ["antd", "@ant-design/icons"] },
					{ name: "lodash", packages: ["lodash", "lodash-es"] },
				]
			}),
		],
	}
});
```




### rollup 也可以用

> 也能作为插件使用，用法和vite一样，但不支持dedup参数

```ts
import { createManualChunks } from "@build-script/vite-plugin-split-vendor";

const chunks = createManualChunks({
  // 这里的配置和vite的配置一样
  ...
});

const rollupOptions = {
  output: {
	manualChunks: chunks.callback,
  },
};
```
