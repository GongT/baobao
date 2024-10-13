## index [task] - 创建导出索引

从整个项目所有文件中收集导出，生成一个`__create_index.generated.ts`文件，放在`tsconfig.json`旁边。

-   “整个项目”是指通过TypeScript api，获取到“运行tsc -p时会读取的文件”列表

```jsonc
{
	"collec": {
		"taskPlugin": {
			"pluginPackage": "@build-script/heft-autoindex-plugin",
			"options": {
				"project": "src/tsconfig.json",
				// 或者: (不建议，最好使用tsconfig)
				// "include": [],
				// "exclude": [],
				// "files": []
			},
		},
	},
}
```
