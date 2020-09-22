[中 文](./README.cn.md)

# export-all-in-one

Collect ALL `export` from your TypeScript project, export them in ONE entry file, so that others can `import { Any, thing, they, want } from '@your/package'`. No matter which file is `Any`/`thing` placed.

# Usage:

#### Step 1: install

```bash
npm -g install build-script
```

#### Step 2: update your tsconfig

`outDir` is required in `tsconfig.json`. Compile in place is not supported.

#### Step 3: do the magic

_`tsconfig.json` can omit, order of the 2 commands is **not** important_

```sh
export-all-in-one ./path/to/tsconfig.json
tsc -p ./path/to/tsconfig.json
```

**💥BOOM**, everything exported.

# Tips:

1. set entry file in your package.json  
   This tool will create a `_export_all_in_one_index.js` in `outDir`, you should set `main` in package.json to that file.
1. you should also modify `types` or `typings` field in `package.json`, value should be`./docs/package-public.d.ts`.
1. dual stack package: commonjs + esm  
   If dual package is detected, this tool will also create a `_export_all_in_one_index.cjs` file, you should set `exports` in package.json.

See:

-   [@build-script/typescript-transformer-dual-package](https://www.npmjs.com/package/@build-script/typescript-transformer-dual-package)
-   [@build-script/export-all-in-one-inject](https://www.npmjs.com/package/@build-script/export-all-in-one-inject)

# Options:

If an **expoted** symbol has doc-comment (`/** */`):

-   with `@extern`: always export
-   with `@internal`: never export
-   nothing: use _default_ (see _exportEverything_)

non-export symbol will never be export.

Configure in `package.json`:

```jsonc
{
	"exportAllInOne": {
		"exportEverything": true
	}
}
```

| config           | type    | default | description                         |
| ---------------- | ------- | ------- | ----------------------------------- |
| exportEverything | boolean | true    | will all symbol exported by default |

# It will do:

1. Resolve all project files from given tsconfig.json
1. Collect all exported thing from these files
1. Join all of them into a single `_export_all_in_one_index.ts` (in a temp folder)
1. Compile `_export_all_in_one_index.ts` and copy result file(s) back to `outDir` folder
1. Call `@microsoft/api-extractor` to parse `_export_all_in_one_index.ts` and copy results into `your-package-root/docs/`

# Limits:

PS: Of course, all your file can not export two same named symbol....  
But you have no reason to do that, except you want to fool your IDE.

PS2: default export will convert to named export, name is it's file name. (unstable)
