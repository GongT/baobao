const singleton = Symbol.for('@build-script/builder/api-interface');

if (!global[singleton]) {
	const resolve = require('path').resolve;
	global[singleton] = require(resolve(__dirname, '../lib/api/context.js'));
}

module.exports = global[singleton];
