const singleton = Symbol.for('@idlebox/build-script/api-interface');

if (!global[singleton]) {
	global[singleton] = require('./lib/api/context.js');
}

module.exports = global[singleton];
