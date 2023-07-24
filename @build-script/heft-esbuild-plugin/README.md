# [heft](https://heft.rushstack.io/)-[esbuild](https://esbuild.github.io/)-plugin

-   run esbuild from heft
-   support rig packages

## TODO

Watch mode is not implemented yet. currentlly `taskDependencies` is required to trigger build, otherwise it won't build at all in watch mode. normal build is ok.

## Usage

1. add task in heft.json:
    ```jsonc
    	"esbuild": {
    		// "taskDependencies": ["typescript"], // you may need this
    		"taskPlugin": {
    			"pluginPackage": "@build-script/heft-esbuild-plugin",
    			"options": {
    				"any": "thing"
    			}
    		}
    	},
    ```
2. create config file `config/esbuild.{ts,mts,cts,mjs,cjs,json}` **(no `.js`!)**
3. write export options. example:
    ```ts
    /// <reference types='@build-script/heft-esbuild-plugin' />
    import type { BuildOptions, Plugin } from 'esbuild';
    export const options: BuildOptions[] = [
    	{
    		entryPoints: [{ in: './src/renderer.ts', out: 'renderer' }],
    		platform: 'browser',
    		outdir: './lib',
    		external: ['electron'],
    		plugins: [nodeSassPlugin()],
    	},
    	{
    		entryPoints: [{ in: './src/window/preload.ts', out: 'preload' }],
    		platform: 'node',
    		outdir: './lib',
    		define: { 'process.env.NODE_ENV': 'production' },
    		external: ['electron'],
    	},
    ];
    ```

## session api

config script will have a `globalThis.session` object, which has type: [IGlobalSession](./src/common/type.ts)

This object will delete after script load, you must save a copy if you want to use it.

This is correct:

```ts
const session = globalThis.session; // save local copy for use
createEsbuildPlugin(session);
function after() {
	console.log(session.rootDir);
}
```

This is wrong:

```ts
function after() {
	console.log(session.rootDir); // Oops! session is gone
}
```

## Write file hook

see: [IOutputModifier](./src/common/type.ts)

```ts
const session = globalThis.session; // save local copy for use
export function onEmit(files, options, lastReturn) {
	files[0].text = '/** xxx */' + files[0].text;
	files.push({ path: '/absolute/path.js', text: 'xxxxx' });
}
```

## Note

### Dependencies

You must install `esbuild` your-self.

If you use `.ts` as config file, `typescript` and `ts-node` is also required.

Depenency packages can be installed in rig package.

### Settings

There are some default settings: [see this file](./src/common/config.ts)

Your config file override each options, not extend them. (except `loader` is extend)

Required options:

-   outdir
-   entryPoints

Deleted options: (throw if set)

-   outfile
-   absWorkingDir

Ignored options:

-   write: handle by library
-   metafile: force to true

### ts-node

`ts-node` is registered if (and only if) config file is `.ts`. It will not unregister anymore.

If `type` field in `package.json` is `module`, you must create a `config/package.json` with content `{"type":"commonjs"}`.

You can create a `config/tsconfig.json` for ts-node.
