# heft Plugin Base

This package provides a base class for creating plugins for the [heft](https://www.npmjs.com/package/@rushstack/heft) build system.

## typescript loader

Use for debug, it will transpile ts files when js files is not exists.

```
require("@build-script/heft-plugin-base/ts-loader").default(module, {
	dist: "./dist/plugin.js",
	src: "./src/plugin.ts",
});
```
