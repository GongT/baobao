Error.stackTraceLimit = Number.POSITIVE_INFINITY;
const { install } = require('source-map-support');
if (!process.execArgv.some((e) => e.startsWith('--inspect')) && !process.execArgv.includes('--enable-source-maps')) {
	install();
}
require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/transform/main.js',
	src: '../src/transform/main.ts',
	check: false,
});
