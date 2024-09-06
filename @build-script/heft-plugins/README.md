# [heft](https://heft.rushstack.io/)插件集

## codegen [task] - 代码生成器

根据tsconfig搜索项目，找到所有以`XXX.generator.ts`结尾的文件，调用其中的generate函数，将结果写入`XXX.generated.ts`。

```ts
import type { FileBuilder, IOutputShim } from '@build-script/heft-plugins';

export async function generate(builder: FileBuilder, logger: IOutputShim) {
	return 'some-string';
	// or don't return to use builder content
}
```

建议：

-   在tsconfig中添加exclude: `**/*.generator.ts`
-   在`.gitignore`添加: `*.generated.ts`

## typescript [task] - TypeScript编译器

编译TypeScript，这个插件与heft内部的typescript插件无关，但会读取`config/typescript.json`中的`project`字段。

可用选项 (options):

-   `project`: tsconfig位置，相对于当前`package.json`，如果不设置，首先读取`config/typescript.json`（包含rig），如果还是没有设置，则分别尝试`src/tsconfig.json`和`tsconfig.json`。如果仍然没有找到就报错。
-   `extension`: 更新`import`语句，给specifier加上`.mjs`或`.cjs`。并改变实际写入的文件扩展名。（可以用其他扩展名，但没有意义）
-   `fast`: 如果设为`true`，则执行`noCheck`模式（即：去除类型定义，不做任何typescript相关检查）。可以在多输出时加速编译，并且防止反复报错。
-   `compilerOptions`: 覆盖编译选项
    -   `plugins`: Plugin对象数组。提供扩展支持，基本兼容其他类似工具（可以直接写在`tsconfig.json`文件中）

<details>
<summary>扩展功能</summary>

Plugin对象:

| field             | type    | description                                      |
| ----------------- | ------- | ------------------------------------------------ |
| transform         | string  | 要引入的包，必须是CommonJs                       |
| importName        | string  | 导出名称(默认为`default`)                        |
| after             | boolean | 如果设为`true`，此插件在ts内置.js处理器之后运行  |
| afterDeclarations | boolean | 如果设为`true`, 此插件在ts内置d.ts处理器之后运行 |
| options           | any     | 任意对象，直接传递给插件函数                     |

```ts
/** 插件函数定义 */
interface IMyTransformCallback<T = ts.SourceFile | ts.Bundle> {
	(context: ts.TransformationContext, program: ts.Program, options: any, ts: typeof ts): ts.Transformer<T>;
}
```

</details>

注意:

1. 当使用compilerOptions覆盖功能时，其中所有类似路径的字段（例如rootDir/typeRoots/declarationDir）都相对于当前包的根目录（即package.json所在的目录）。
   官方heft-plugin-typescript插件中，这些字段是相对于rig包目录的。
2. `include`/`exclude`/`files`/`outDir`均相对于解析后`compilerOptions.rootDir`（符合直觉）

<details>
<summary>示例</summary>

```json
{
	"do-compile": {
		"taskPlugin": {
			"pluginName": "typescript",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				"project": "src/tsconfig.json",
				// "include": [], "exclude": [], "files": []
				"extension": "mjs",
				"compilerOptions": {
					"module": "esnext",
					"outDir": "../lib/mjs",
					"plugins": [{ "transform": "xxx" }]
				}
			}
		}
	},
	"compile-again": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "typescript",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				"project": "src/tsconfig.json",
				// "include": [], "exclude": [], "files": []
				"fast": true,
				"extension": "cjs",
				"compilerOptions": {
					"module": "commonjs",
					"outDir": "../lib/cjs",
					"plugins": [{ "transform": "yyy" }]
				}
			}
		}
	}
}
```

</details>

## create-index [task] - 创建导出索引

从整个项目所有文件中收集导出，生成一个`__create_index.generated.ts`文件，放在`tsconfig.json`旁边。

-   “整个项目”是指通过TypeScript api，获取到“运行tsc -p时会读取的文件”列表

```json
{
	"collec": {
		"taskPlugin": {
			"pluginName": "create-index",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				"project": "src/tsconfig.json"
				// 或者: (不建议，最好使用tsconfig)
				// "include": [],
				// "exclude": [],
				// "files": []
			}
		}
	}
}
```

## modify-entry [task] - 处理入口文件

对入口（bin、main、module）文件添加头尾内容，或者设置可执行。

```json
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
					"missing": true // 允许 docs/suffix-content.js 不存在（始终允许package.json中的bin不存在）
				}
			}
		}
	}
}
```

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

```json
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
				"inheritEnv": true
			}
		}
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
				"script": "echo hello"
			}
		}
	}
}
```

</details>

## import-test [task] - 测试导入

分别对当前包进行`import()`和`require()`调用，测试是否能正常导入。

注意：这个工具不能检测把依赖写到devDependencies导致运行时缺失的情况。

用法:

```json
{
	"task-test": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "import-test",
			"pluginPackage": "@build-script/heft-plugins"
		}
	}
}
```
