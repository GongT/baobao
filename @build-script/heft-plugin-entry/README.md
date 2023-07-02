# locally load heft plugin

-   if js file exists: load it
-   else: load ts file using ts-node

Useful when developing/testing heft plugin it self. ts-node is a dev-dependency, so only tiny overhead when published to npm.

### usage:

```typescript
import { loadPlugin } from '@build-script/heft-plugin-entry';
import { resolve } from 'path';

module.exports = loadPlugin({
	projectRoot: resolve(__dirname, '..'),
	distEntry: 'lib/plugin.js',
	sourceEntry: 'src/plugin.ts',
});
```
