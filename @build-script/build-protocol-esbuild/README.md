# @build-script/build-protocol-esbuild
[@build-script/build-protocol](https://npmjs.com/package/@build-script/build-protocol) plugin for [esbuild](https://esbuild.github.io/) and [esbuild-problem-matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers)

### 使用:

```typescript
/** 这是 esbuild.ts */

// 静态定义
await defineEsbuild('instance-name', {
	entryPoints: {},
	// ... options ...
	plugins: [], // 插件会被自动插入到最后
});

// 动态定义
await defineEsbuild('instance-name', (isDev: boolean) => {
	return {
		entryPoints: {},
		// ... options ...
	};
});
```

`defineEsbuild`实际上返回`BuildContext`，但由于watch和build都已经做了，退出时`esbuild`自己会清理，所以大部分时候都不需要用到。

然后直接运行它，如果process.argv包含-w或--watch，则进入watch模式，否则build一次。
```bash
# BUILD_PROTOCOL_SERVER=node:ipc 
ts-node ./esbuild.ts
```
