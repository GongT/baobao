const { Module } = require('module');

const copy = {};
const cjs = Module._extensions['.js'];

for (const i in Module._extensions) {
	copy[i] = Module._extensions[i];
	delete Module._extensions[i];
}

Module._extensions['.cjs'] = cjs;

Object.assign(Module._extensions, copy);
