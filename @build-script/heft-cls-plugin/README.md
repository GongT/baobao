## cls [lifecycle] - 清屏

启动和每次运行watch时清屏。

以下情况不执行：
* stderr不是tty
* heft 调试模式: `heft --debug xxx`
* 通过npm lifecycle启动（通过检测 $env:npm_lifecycle_event）: `npm publish`/`npm pack`

```ts
{
	"$schema": "https://developer.microsoft.com/json-schemas/heft/v0/heft.schema.json",

	"heftPlugins": [
		{ "pluginPackage": "@build-script/heft-cls-plugin" },
	]
}
```
