[中 文](./README.cn.md)

# What is this

This is a [**t**typescript](https://github.com/cevek/ttypescript/) transformer:

-   Transpile each source files **again** after it's normal emit. And create commonjs files, next to esm versions, with `.cjs` extension.
-   append `.js` after every top-level `import`s (dynamic ones currently not support)
-   convert `import.meta.url` to `"file://" + __filename` in `.cjs` files
-   convert `import ... from "commonjs-library"` to `import x from "commonjs-library"; const ... = x;` in `.js` files

# Usage

## Method A: heft

1. Install `@rushstack/heft`, see it's documents
2. set `"emitCjsExtensionForCommonJS": true,` in `config/typescript.json`
3. Add the transformer to your `tsconfig.json`:
    ```jsonc
    {
    	"compilerOptions": {
    		"module": "esnext", // highly recommend
    		"plugins": [
    			{
    				"transform": "@build-script/typescript-transformer-dual-package"
    				// "cjs": ".cjs",
    				// "mjs": ".js"
    				// "verbose": true
    			}
    		]
    	}
    }
    ```

## Method B: ttypescript

1. Install `typescript`, `ttypescript`, and this transformer
    ```bash
    npm install --save-dev typescript ttypescript @build-script/typescript-transformer-dual-package
    ```
1. Add the transformer to your `tsconfig.json`:
    ```jsonc
    {
    	"compilerOptions": {
    		"module": "esnext", // this is required (maybe lower version, but commonjs/system etc is not valid)
    		// ... other options
    		"plugins": [
    			{
    				"transform": " @build-script/typescript-transformer-dual-package",
    				// "compilerOptions": {
    				// [optional]
    				// normally you do not need to set this.
    				//... override parent compilerOptions when compile commonjs
    				// some options can not override
    				// },
    				"verbose": false // [optional] print debug output
    			}
    		]
    	}
    }
    ```
1. Write typescript as you want. But:
    - **Do not use any `require` in your code!**, `await import()` instead (this rule not including `module::createRequire`)
    - Do not add `\.(c|m)?js` at end of `import` statement. (bad: `import "./some-file.js"`)
1. Compile with `ttsc`, instead of `tsc` (package tools like `webpack` also support ttypescript, please refer to their docs)
    ```bash
    npm install ttypescript
    ttsc -p path/to/tsconfig.json
    ```
1. Update your `package.json` like that:
    ```jsonc
    {
    	"type": "module",
    	"main": "lib/api.cjs",
    	"module": "lib/api.js",
    	// maybe "esnext", "browser" etc
    	"bin": {
    		"some-cli-command": "lib/bin.cjs"
    	},
    	"exports": {
    		".": {
    			"require": "lib/api.cjs",
    			"import": "lib/api.js"
    		}
    	}
    }
    ```

# Related pages:

-   TypeScript Transform:
    -   If someday typescript directlly support transformer from commandline or tsconfig, `ttypescript` can be removed.
    -   [Typescript Compiler Api Document](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
    -   https://ts-ast-viewer.com/
    -   [ttypescript](https://github.com/cevek/ttypescript)
-   [RushStack](https://rushstack.io/)
-   Add custom extension:
    -   [TypeScript#27957](https://github.com/microsoft/TypeScript/issues/27957)
    -   [TypeScript#18442](https://github.com/microsoft/TypeScript/issues/18442)
    -   Initial idea comes from: [Zoltu/typescript-transformer-append-js-extension](Zoltu/typescript-transformer-append-js-extension)
-   Node.JS:
    -   `exports` field in package.json: [Conditional Exports](https://nodejs.org/api/esm.html#esm_conditional_exports)

# How

1. `tsc`/`ttsc` run
    1. Load my package
    1. Create `Program`, setup all transformers, including this one
1. When `Program` `emit`, for each output file, my transformer run:
    1. Modify all `ImportDeclaration` and `ExportDeclaration`, add `.js` to them
    1. Create another `Program`
        - it will compile emitted file **Again**, with new compilerOptions, which "module" is "commonjs"
        - add `.cjs` to all `ImportDeclaration` and `ExportDeclaration`
