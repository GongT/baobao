# export-all-in-one

# Usage:

#### Step 1: install

```bash
yarn global add build-script
## or
npm -g install build-script
```

#### Step 2: update your tsconfig

`outDir` is required in `tsconfig.json`. Compile in place is not supported.

#### Step 3: do the magic

_`tsconfig.json` can omit_

```sh
export-all-in-one ./path/to/tsconfig.json
tsc -p ./path/to/tsconfig.json
```

# Configure:

in `package.json`:

```jsonc
{
	"exportAllInOne": {}
}
```

| config           | type    | default | description                                                                                                                              |
| ---------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| exportEverything | boolean | true    | If `false`, **only** symbol with `/** @extern */` will be exported. If `true`, all symbol **except** `/** @internal */` will be exported |

# It will do:

1. Resolve ALL files from given tsconfig.json
1. Collect ALL exported thing from these files
1. Join ALL of them into a single \_export_all_in_one_index.ts (in temp folder)
1. Compile it

**BOOM**, everything exported, others can do `import { anything, they, want } from '@your/package'`.

PS: Of course, all your file can not export two same named symbol....  
But you have no reason to do that, except you want to fool your IDE.

PS2: default export will convert to named export, name is it's file name. (unstable)

PS3: Remember to use `/** @internal */` :D
