## shell [task] - 运行任意程序

类似`heft`官方内部插件`run-script-plugin`，但允许运行任意程序。（例如python、bash）

| field            | type                   | description                                                     |
| ---------------- | ---------------------- | --------------------------------------------------------------- |
| interpreter      | string                 | 解释器。如果不设置默认为node（此时功能和run-script-plugin一样） |
| interpreterArgs  | string[]               | 解释器参数                                                      |
| script           | string                 | 脚本路径                                                        |
| args             | string[]               | 脚本参数                                                        |
| env              | Record<string, string> | 环境变量                                                        |
| inheritEnv       | boolean                | 默认为true，设为false时使用空白环境变量                         |
| workingDirectory | string                 | 工作目录，默认为`.`，相对于包根目录                             |

<details>
<summary>示例</summary>

```jsonc
{
	"hello": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "shell",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				// 将会运行: python3 -B hello.py aaa
				"interpreter": "python3",
				"interpreterArgs": ["-B"],
				"script": "hello.py",
				"args": ["aaa"],
				"env": { "PYTHONUTF8": "1" },
				"inheritEnv": true,
			},
		},
	},
	"bash": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "shell",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				// 将会运行: bash -c 'echo hello'
				"interpreter": "bash",
				"interpreterArgs": ["-c"],
				"script": "echo hello",
			},
		},
	},
}
```

</details>
