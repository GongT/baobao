# typescript [task] - TypeScript编译器

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

```jsonc
{
	"do-compile": {
		"taskPlugin": {
			"pluginPackage": "@build-script/heft-typescript-plugin",
			"options": {
				"project": "src/tsconfig.json",
				// "include": [], "exclude": [], "files": []
				"extension": "mjs",
				"compilerOptions": {
					"module": "esnext",
					"outDir": "../lib/mjs",
					"plugins": [{ "transform": "xxx" }],
				},
			},
		},
	},
	"compile-again": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "typescript",
			"pluginPackage": "@build-script/heft-typescript-plugin",
			"options": {
				"project": "src/tsconfig.json",
				// "include": [], "exclude": [], "files": []
				"fast": true,
				"extension": "cjs",
				"compilerOptions": {
					"module": "commonjs",
					"outDir": "../lib/cjs",
					"plugins": [{ "transform": "yyy" }],
				},
			},
		},
	},
}
```

</details>
