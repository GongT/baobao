# Vite chunks 手动拆分依赖包的插件

**目前仅支持pnpm monorepo**

### 使用

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




### rollup 也可以用（不是作为插件）

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
