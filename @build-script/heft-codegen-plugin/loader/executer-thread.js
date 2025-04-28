Error.stackTraceLimit = Number.POSITIVE_INFINITY;
const { install } = require('source-map-support');
if (!process.execArgv.some((e) => e.startsWith('--inspect')) && !process.execArgv.includes('--enable-source-maps')) {
	install();
}
// console.log('executer thread running with realtime compile!');
require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/executer-thread.js',
	src: '../src/executer-thread.ts',
	check: false,
});
