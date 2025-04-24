Error.stackTraceLimit = Number.POSITIVE_INFINITY;
if (!process.argv.some((e) => e.startsWith('--inspect')) && !process.execArgv.includes('--enable-source-maps')) {
	require('source-map-support/register');
}
// console.log('executer thread running with realtime compile!');
require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/executer-thread.js',
	src: '../src/executer-thread.ts',
	check: false,
});
