## esbuild [task] - 运行esbuild

-   从heft调用esbuild
-   支持rig

## TODO

监视模式未实现

## Usage

1. 向 `heft.json` 添加:
    ```jsonc
    	"esbuild": {
    		// "taskDependencies": ["typescript"], // 当前需要设置这个才能在监视模式下工作（否则只能运行第一次）
    		"taskPlugin": {
    			"pluginPackage": "@build-script/heft-esbuild-plugin",
    			"options": {
    				"any": "thing"
    			}
    		}
    	},
    ```
2. 创建文件: `config/esbuild.{ts,mts,cts,mjs,cjs,json}` **不能用`.js`后缀**
3. 编写配置文件，并导出`options`，可以是数组，同时运行多个esbuild:

    ```ts
    /// <reference types='@build-script/heft-esbuild-plugin' />
    import type { BuildOptions, Plugin } from 'esbuild';

    console.assert(options.any === 'thing', 'what the f*ck?');

    export const options: BuildOptions[] = [
    	{
    		entryPoints: [{ in: './src/renderer.ts', out: 'renderer' }],
    		platform: 'browser',
    		outdir: './lib',
    		external: ['electron'],
    		plugins: [nodeSassPlugin()],
    	},
    	{
    		entryPoints: [
    			{ in: './src/preload.ts', out: 'preload' },
    			{ in: './src/main.ts', out: 'main' },
    		],
    		platform: 'node',
    		outdir: './lib',
    		define: { 'process.env.NODE_ENV': 'production' },
    		external: ['electron'],
    	},
    ];
    ```

### session api

esbuild脚本中可以访问全局变量`session`

-   [IGlobalSession](./src/common/type.ts)
-   `session.options` 就是从 `heft.json` 设置中传递的 `options` 字段

注意：此全局变量会在脚本加载后删除，如果需要使用，必须赋值到本地变量。

例如:

```ts
const session = globalThis.session; // save local copy for use

function after() {
	console.log(session.rootDir);
}
```

不可以这样:

```ts
function after() {
	console.log(session.rootDir); // Oops! session is gone
}
```

### 文件写入钩子

[IOutputModifier](./src/common/type.ts)

```ts
import type { OutputFile } from '@build-script/heft-esbuild-plugin';
import type { BuildOptions } from 'esbuild';
interface T {
	field: number;
}
export function onEmit(files: OutputFile[], options: BuildOptions, state: T): T {
	files[0].text = "/** note: don't use this file */\n" + files[0].text;
	files.push({ path: '/absolute/path.js', text: 'virtual file' });

	return state;
}
```

## 注意事项

### 依赖问题

你的项目中必须添加esbuild，本项目不提供内置版本。

如果配置文件是TypeScript编写，则你的项目还需要安装`typescript`。

依赖包也可以在rig包中安装。

### esbuild 设置

有一些默认设置: [查看这个文件](./src/common/config.ts)

你提供的options将会覆盖对应默认值，而不是扩展它们。(除了`loader`是扩展的)

必须通过`options`提供的:

-   outdir
-   entryPoints

不允许的: （如有则抛出错误）

-   outfile: 强制使用outdir
-   absWorkingDir: 强制为buildFolder（也就是package.json所在的目录）

忽略的:

-   write: 强制为false，本插件接管写入操作
-   metafile: 强制为true，否则写入工作无法完成

### typescript 配置文件

如果配置文件使用ts编写，可以创建 `config/tsconfig.json` 用于编译配置文件。  
配置文件使用标准编译过程，而不是transpile。不能通过检查则不会执行esbuild。如需放松检查，需自行编辑`config/tsconfig.json`。
