# export-all-in-one

```bash
yarn global add @gongt/export-all-in-one
## or
npm -g install @gongt/export-all-in-one
```

```bash
export-all-in-one ./path/to/tsconfig.json
```

1. Resolve ALL files from given tsconfig.json
1. Collect ALL exported thing from these files
1. Join ALL of them into a single _export_all_in_once_index.ts (place next to tsconfig.json)
1. (You can) Setup `rollup` _export_all_in_once_index.ts as entry

1. **BOOM**, everything exported. everyone can `import {anything, they, want} from '@your/package'`.

PS: Of course, all your file can not export two same named symbol....     
But you have no reason to do that, except you want to fool your IDE.

PS2: default export is exported as it's file name. (unstable)   

PS3: Remember to use `/** @internal */` :D

