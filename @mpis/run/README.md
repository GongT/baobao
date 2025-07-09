# 究极简单的分步构建器

简单地按顺序执行一系列外部命令，最终完成项目的构建过程

为实现watch，所有命令需要支持 [构建协议](../shared)

对于不支持的命令，可以使用 [标准输出监视器 或 客户端API](../client) 快速实现

Path中添加`当前包`和`rig包`的`node_modules/.bin`目录


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
		{
			// 也可以写成字符串，但强烈不建议，无法正确处理空格和特殊字符，且额外增加一层shell
			"command": ["codegen", "src"]
		},
		{
			"title": "autoindex",
			"command": {
				// 运行指定包里的指定bin，不会自动安装此包，它必须存在于当前包或rig包的依赖中，此binary必须是js文件
				"package": "@build-script/autoindex",
				// 要执行的bin名字，必须设置。但如果此包的bin字段是字符串，则必须不设置。
				"binary": "autoindex",
				"arguments": ["src"]
			}
		},
		// 可以从 commands 中引用
		"some-common-command",
		{
			// 可选，默认为command的第一个单词，仅用于显示
			"title": "typescript",
			"command": ["mpis-tsc", "-p", "src"],
			// 可选，当调用watch时默认添加 -w 可以换成其他参数代替 -w
			"watch": ["--watch" ]
		},
		{
			"title": "esbuild",
			// 当command第一个元素是 xxx.ts，可以直接执行它，此文件相对于package.json所在路径，同时也会在rig/profile和rig根目录中寻找同名文件
			"command": ["scripts/esbuild.config.ts"],
			// 此命令的工作目录，相对于package.json所在目录
			"cwd": "."
		},
		{
			"title": "esbuild",
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
	"commands": {
		  // 可以在此处定义一些常用的命令，供其他命令引用
		"some-common-command": {
			"title": "common command",
			"command": ["some-command", "--arg=value"]
		}
	},
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

```json
{
	"name": "my-project",
	"version": "1.0.0",
	"scripts": {
		"prepack": "mpis-run build --clean",
		"build": "mpis-run build",
		"watch": "mpis-run watch",
		"clean": "mpis-run clean"
	},
}
```
