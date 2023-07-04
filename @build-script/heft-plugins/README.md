# heft plugin collection

## typescript [task]

Build typescript project. This plugin not related to heft's internal typescript plugin, but it will read `project` in "config/typescript.json".

Options:

-   `project`: tsconfig location, relative to current project.json, override `config/typescript.json``.
-   `include`/`exclude`/`files`: override `tsconfig.json`, not join!
-   `extension`: update `import` statements, add `.mjs` or `.cjs` to specifiers (also hook file write).
-   `fast`: if `true`, will modify compilerOptions, skip most check to speed up compile. (useful for multi-output)
-   `compilerOptions`: extends `tsconfig.json`'s `compilerOptions` field.
    -   `module`: only need when using multi-output. currently only support `commonjs` and `esnext`.
    -   `outDir`: like `module`.
    -   `plugins`: array, append to `tsconfig.json`'s `plugins` field.

Plugin option:

| field             | type    | description                       |
| ----------------- | ------- | --------------------------------- |
| transform         | string  | module specifier to `require()`   |
| after             | boolean | if true, add to after             |
| afterDeclarations | boolean | if true, add to afterDeclarations |
| importName        | string  | defaults to `default`             |
| options           | any     | direct pass to callback function  |

```ts
interface IMyTransformCallback<T = ts.SourceFile | ts.Bundle> {
	(context: ts.TransformationContext, program: ts.Program, options: any, ts: typeof ts): ts.Transformer<T>;
}
```

Note:

1. If `tsconfig.json` file not found, and `config/rig.json` exists, rig package will be used.  
   All path-like field _(eg. rootDir/typeRoots/declarationDir)_ will resolve to current package.  
   Official plugin will resolve inside rig package.
2. `include`/`exclude`/`files`/`outDir` is relative to `rootDir` in final resolved `compilerOptions`, not package root or config/ folder.

```json
{
	"typescript": {
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
	"typescript-cjs": {
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

## create-index [task]

Collect all exports in all project files, and generate `index.ts` in `src` folder.

```json
{
	"create-index": {
		"taskPlugin": {
			"pluginName": "create-index",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				"project": "src/tsconfig.json"
				// or:
				// "include": [],
				// "exclude": [],
				// "files": []
			}
		}
	}
}
```

## shell [task]

Like `heft`'s internal `run-script-plugin`, but allow run any program (eg. python).

Usage:

```json
{
	"task-exec": {
		"taskDependencies": ["typescript"],
		"taskPlugin": {
			"pluginName": "shell",
			"pluginPackage": "@build-script/heft-plugins",
			"options": {
				"interpreter": "python3",
				"interpreterArgs": ["-B"],
				"script": "hello.py", // required
				"args": ["aaa"],
				"env": { "PYTHONUTF8": "1" },
				"inheritEnv": true,
				"workingDirectory": "tests"
			}
		}
	}
}
```

## import-test [task]

Try `import()` and `require()` current package, to test if it's importable.

Usage:

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
