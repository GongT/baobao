const singleton = Symbol.for('@build-script/builder/api-interface');

if (!global[singleton]) {
	global[singleton] = require('./lib/api/context.cjs');
}

module.exports = global[singleton];
