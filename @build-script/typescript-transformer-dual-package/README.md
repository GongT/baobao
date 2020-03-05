# What is this

> this package is a **t**typescript transformer, it compile all source files **again** after normal compile, to generate `.cjs` files.

# Usage

1. Install `typescript`, `ttypescript`, and this transformer into your project if you don't already have them.
    ```bash
    npm install --save-dev typescript ttypescript @build-script/typescript-transformer-dual-package
    ```
1. Add the transformer to your `tsconfig.json`:
    ```jsonc
    {
    	"compilerOptions": {
    		"module": "esnext", // this is required
    		// ... other options
    		"plugins": [
    			{
    				"transform": "@idlebox/itypescript-transformer-append-cjs-extension",
    				"compilerOptions": {
    					// [optional] normally you do not need to set this.
    					//... override parent compilerOptions when compile commonjs
    					// some options can not override
    				},
    				"verbose": false // optional, can be number "1", to send verbose output to stdout (instead of stderr)
    			}
    		]
    	}
    }
    ```
1. Write typescript as you want. But:
    - **Do not use any `require` in your code!**, `await import()` instead
    - Do not add `\.(c|m)?js` at end of `import` statement. (bad: `import "./some-file.js"`)
1. Compile using `ttsc`
    ```bash
    ttsc -p path/to/tsconfig.json
    ```
1. Update your `package.json` like that:
    ```jsonc
    {
    	// ...
    	"type": "module",
    	"main": "lib/api.cjs",
    	"module": "lib/api.js",
    	"bin": {
    		"a-command": "lib/bin.cjs"
    	},
    	"exports": {
    		".": {
    			"require": "lib/api.cjs",
    			"import": "lib/api.js"
    		}
    	}
    	// ...
    }
    ```
1. (If your package has binary)
    1. install package `@build-script/dual-package-runtime`
    1. add this line at first of your bin file(s).
    ```js
    import '@build-script/dual-package-runtime';
    ```

# Related pages:

-   TypeScript Transform:
    _ If someday typescript directlly support transformer from commandline or tsconfig, `ttypescript` can be removed.
    _ [Api Document](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) \* [ttypescript](https://github.com/cevek/ttypescript)
-   Add custom extension:
    _ Typescript will support custom extension very soon, after that, this package can be removed. (use two pass compile instead):
    _ [TypeScript#27957](microsoft/TypeScript#27957)
    _ [TypeScript#18442](microsoft/TypeScript#18442)
    _ Initial idea comes from: [Zoltu/typescript-transformer-append-js-extension](Zoltu/typescript-transformer-append-js-extension)
-   Node.JS: \* [Conditional Exports](https://nodejs.org/api/esm.html#esm_conditional_exports)

# How

1. `tsc`/`ttsc` run
    1. Load my package
        1. Create a transformer factory
    1. Create `Program`, setup transformers, including mine
1. When `Program` `emit`, my transformer run:
    1. Modify all `ImportDeclaration` and `ExportDeclaration`, add `.js` to them
        - Because tsc itself know what is `import {} from "./x.js"`, everything works as expect
    1. I create another `Program`, load a "internal" extension
