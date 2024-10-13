require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/transform/main.js',
	src: '../src/transform/main.ts',
	check: false,
});
