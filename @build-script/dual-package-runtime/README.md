# dual package runtime

When you run `require("./some/file")`, it will try "some/file.js" first, and throw if not found.  
But with this package, it will try "some/file.cjs" first, then "some/file.js", if both not found, throw.

Note: this will not effect any `import`, only affect `require()`(include transpiled ones).

## Usage:

```
import "@build-script/dual-package-runtime";

import { xxx } from "./some-my-files";
```

Or

```
require("@build-script/dual-package-runtime");

const { xxx } = require("./some-my-files");
```

---

## Example

index.js:

```js
require('./test');
```

test.cjs:

```js
console.log('test.cjs has been imported');
```

test.js:

```js
console.log('test.js has been imported');
```

-   `node ./index.js`:  
     test.js has been imported
-   `node -r "@build-script/dual-package-runtime" ./index.js`:  
     test.cjs has been imported
