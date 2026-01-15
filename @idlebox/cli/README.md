# cli tools

统合包:
* [@idlebox/args](../args)
* [@idlebox/cli-help-builder](../builder)
* [@idlebox/logger](../logger)
* [@idlebox/source-map-support](../support)

### Usage

### dynamic

```ts
import { makeApplication } from '@idlebox/cli';

await makeApplication('some-cli', 'a tool for better life')
	.dynamic(import.meta.dirname, 'commands/**/*.command.js');
```

### static

1. generate static file:
```bash
pnpx @idlebox/cli-static-generator 'src/commands/*.ts'
```

@see [example usage](../../@build-script/package-tools/src/main.ts)
