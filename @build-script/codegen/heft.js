require('@gongt/fix-esm').register();

try {
	Error.stackTraceLimit = Infinity;
	module.exports = require('./lib/api.js');
} catch (e) {
	console.error(process.argv);
	console.error(e.stack);
	module.exports = undefined;
	// throw e;
}
