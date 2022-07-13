require('@gongt/fix-esm').register();

try {
	Error.stackTraceLimit = Infinity;
	module.exports = require('./lib/plugin.js');
} catch (e) {
	console.error(e.stack);
	throw e;
}
