# yet another esbuild html entry plugin

### Usage:
```js
import { HtmlEntryPlugin } from '@gongt/esbuild-html-entry'


const ctx = await esbuild.context({
	entryPoints: ['src/index.html'],
	outdir: 'lib',
	entryNames: '[name]-[hash]',
	metafile: true, // <-- this is required
	plugins: [
		new ESBuildHtmlEntry(), // should be first in most case
	],
});

await ctx.rebuild();
await ctx.dispose();
```

### Then write HTML like this:
```html
<!doctype html>
<html>
<head>
	<title>Test App</title>
	<link rel="stylesheet" href="test.css">
	<!-- <link rel="stylesheet" href="missing.css"> -->
	<script type="module" src="index1.ts" defer></script>
	<script type="module" src="index2.ts" defer></script>
	<script>
		console.log('hello static');
	</script>
</head>
<body>
	<h1>This is a test</h1>
</body>
</html>
```

### Note:
* esbuild will bundle files into one, so only first &lt;script> and &lt;link> tag will be used, and type/defer etc will be same value0.
