# What is this
> this package is a **t**typescript transformer, it compile all source files **again** after normal compile, to generate `.cjs` files.

# Usage
1. Install `typescript`, `ttypescript`, and this transformer into your project if you don't already have them.
	```bash
	npm install --save-dev typescript ttypescript @idlebox/typescript-transformer-dual-package
	```
1. Add the transformer to your es2015 module `tsconfig.json`:
	```jsonc
	// tsconfig-es.json
	{
		"compilerOptions": {
			"module": "esnext",
			// ... other options
			"plugins": [
				{
					"transform": "@idlebox/typescript-transformer-append-cjs-extension",
					"compilerOptions": {
						// [optional] normally you do not need to set this.
						//... override parent compilerOptions when compile commonjs, below is the default:
						"target": "es2018",
						"module": "CommonJS", // never set this !!!
						"declaration": false,
						"project": null,
						"isolatedModules": true,
						"composite": false,
						"incremental": false,
						"tsBuildInfoFile": null,
					}
				}
			]
		},
	}
	```
1. Write some typescript with normal imports
   * **Do not use any `require` in your code!**, `await import()` instead
   * Do not add `\.(c|m)?js` at end of `import` statement. (bad: `import "some-file.js"`)
2. Compile using `ttsc`
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
		"bin":{
			"a-command": "lib/bin.cjs"
		},
		"exports": {
			".": {
				"require": "lib/api.cjs",
				"import": "lib/api.js"
			}
		},
		// ...
	}
	```
1. install package `@idlebox/dual-package-runtime` and add one line before your bin file(s). (skip if no cli)
	```js
	import '@idlebox/dual-package-runtime'
	```

# Related pages:
* TypeScript Transform:
  * If someday typescript directlly support transformer from commandline or tsconfig, `ttypescript` can be removed.
  * [Api Document](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
  * [ttypescript](https://github.com/cevek/ttypescript)
* Add custom extension:
  * Typescript will support custom extension very soon, after that, this package can be removed. (use two pass compile instead)
  * [TypeScript#27957](microsoft/TypeScript#27957) [TypeScript#18442](microsoft/TypeScript#18442)
  * [Zoltu/typescript-transformer-append-js-extension](Zoltu/typescript-transformer-append-js-extension)
* Node.JS:
  * [Conditional Exports](https://nodejs.org/api/esm.html#esm_conditional_exports)

