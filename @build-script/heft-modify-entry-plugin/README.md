## modify-entry [task] - 处理入口文件

对入口（bin、main、module）文件添加头尾内容，或者设置可执行。

```jsonc
{
	"post-build": {
		"taskPlugin": {
			"pluginName": "modify-entry",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				// main: {},
				// module: {},
				"bin": {
					"chmod": true, // chmod 0755 (不支持别的模式)
					"prefix": "#!/usr/bin/env node", // 直接字符串
					"suffix": "< docs/suffix-content.js", // 从文件读取（以<开头），搜索顺序: 根目录、rig配置目录、rig根目录
					"missing": true, // 允许 docs/suffix-content.js 不存在（始终允许package.json中的bin不存在）
				},
			},
		},
	},
}
```
