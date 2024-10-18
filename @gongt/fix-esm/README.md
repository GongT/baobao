# fix-esm

fix ERR_REQUIRE_ESM with realtime `esbuild` transform.

`require('@gongt/fix-esm')` will register legacy commonjs loader, mutiple call will ignored. (no way to unregister)

When ERR_REQUIRE_ESM happen, it will spawn esbuild to compile target file. loaded module will inside require cache. compiled result will save at `filename.jsc` to speed up next run.

It's best to use this package in a final-end-user project, not in a library, many people have thier own `fix-esm` method, may cause conflict.
