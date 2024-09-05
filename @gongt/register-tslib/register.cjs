const Module = require('node:module');

const dup_symbol = Symbol.for('register-tslib');
if (!Module[dup_symbol]) {
	Module[dup_symbol] = true;

	const _resolve = Module._resolveFilename;
	const tslib = require.resolve('tslib');
	Module._resolveFilename = function (request, parent, isMain) {
		if (request === 'tslib') {
			return tslib;
		}
		return _resolve(request, parent, isMain);
	};
}
