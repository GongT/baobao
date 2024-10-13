## import-test [task] - 测试导入

分别对当前包进行`import()`和`require()`调用，测试是否能正常导入。

注意：这个工具不能检测把依赖写到devDependencies导致运行时缺失的情况。

用法:

```jsonc
{
	"task-test": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "import-test",
			"pluginPackage": "@build-script/heft-plugins",
		},
	},
}
```
