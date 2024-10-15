require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/plugin.js',
	src: '../src/plugin.ts',
	external: ['@supercharge/promise-pool', 'source-map-support', 'glob', 'esprima', 'comment-json', 'figures'],
});
