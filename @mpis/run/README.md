# 究极简单的分步构建器

简单地按顺序执行一系列外部命令，最终完成项目的构建过程

为实现watch，所有命令需要支持 [构建协议](../shared)

对于不支持的命令，可以使用 [标准输出监视器 或 客户端API](../client) 快速实现


### 配置: 创建文件`config/commands.json`，内容如下：

```jsonc
{
	/**
	 * 示例文件
	 * 
	 * 文件里可以写注释
	 */
	"$schema": "../node_modules/@mpis/run/commands.schema.json",
	"build": [
		// 如果只有command也可以写成字符串
		"codegen src",
		{
			"command": "autoindex src"
		},
		{
			// 可选，默认为command的第一个单词，仅用于显示
			"title": "typescript",
			"command": "mpis-tsc -p src",
			// 可选，当调用watch时默认添加 -w 可以换成其他参数代替 -w ，可以是数组形式
			"watch": "--watch" 
		},
		{
			"title": "esbuild",
			// 当command第一个元素是 ts，可以直接执行它
			"command": "config/esbuild.config.ts"
		},
		{
			"title": "esbuild",
			// command也可以是数组形式，支持命令中带空格等字符
			"command": [
				"build-protocol-client",
				"--start=Starting compilation",
				"--finish=Finished compilation",
				"--success=Successfully .*",
				"--error=Failed to .*",
				"--",
				"some-other-command",
				"--some-arg=some-value",
			]
		},
	],
	"clean": [
		"dist",
		"lib",
	]
}
```

### 运行

* 此处的`run`就是本包安装的bin文件名，如果有冲突，也可以用`mpis-run`代替

```bash
pnpm exec run build
pnpm exec run watch
pnpm exec run clean
```
