# What is this

This is a [**t**typescript](https://github.com/cevek/ttypescript/) transformer:

-   append `.js` after every top-level `import`s (dynamic ones currently not support)

# Usage

1. Install `typescript`, `ttypescript`, and this transformer
    ```bash
    npm install --save-dev typescript ttypescript @build-script/typescript-transformer-dual-package
    ```
1. Add the transformer to your `tsconfig.json`:
    ```jsonc
    {
    	"compilerOptions": {
    		// ... other options
    		"plugins": [
    			{
    				"transform": "@build-script/typescript-transformer-append-js-extension"
    			}
    		]
    	}
    }
    ```
1. Compile with `ttsc`, instead of `tsc` (package tools like `webpack` also support ttypescript, please refer to their docs)
    ```bash
    npm install ttypescript
    ttsc -p path/to/tsconfig.json
    ```
