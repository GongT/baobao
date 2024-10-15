Error.stackTraceLimit = Infinity;
if (!process.argv.some((e) => e.startsWith('--inspect')) && !process.execArgv.includes('--enable-source-maps')) {
	require('source-map-support/register');
}
require('@build-script/heft-plugin-base/loader').default(module, {
	force: true,
	dist: '../lib/bin.js',
	src: '../src/bin.ts',
	check: false,
});
