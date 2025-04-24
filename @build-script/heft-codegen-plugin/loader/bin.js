Error.stackTraceLimit = Number.POSITIVE_INFINITY;
const { install } = require('source-map-support');
if (!process.argv.some((e) => e.startsWith('--inspect')) && !process.execArgv.includes('--enable-source-maps')) {
	install();
}
require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/bin.js',
	src: '../src/bin.ts',
	check: false,
});
