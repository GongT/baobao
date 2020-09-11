# typescript-transformer-import-commonjs

It will convert things like

```js
import { emptyDir } from 'fs-extra';
```

Into

```js
import fs_extra_1 from 'fs-extra';
const { emptyDir } = fs_extra_1;
```

Only if:

1. path is not relative
2. package name directly defined in `dependencies` in `package.json`
3. imported package's `package.json` does not have `"type": "module"`
4. not imported with special extensions: `.cjs` or `.mjs` or `.json`

# Usage

tsconfig.json: _all extra options is optional_

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"transform": "@build-script/typescript-transformer-dual-package",
				"specialExtensions": ["cjs", "mjs", "json", "wasm", "cjs.js"], // defaults to cjs,mjs,json
				"ignore": ["some-module"], // do not change import of this package
				"force": ["some-module"], // force change import even it's type is module
				"package.json": "../package.json" // Current package's json file, defaults to find the nearest one
			}
		]
	}
}
```
