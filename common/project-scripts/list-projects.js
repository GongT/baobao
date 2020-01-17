const {resolve} = require('path');
exports.rushRootPath = resolve(__dirname, '../..');
exports.globalNodeModulesPath = resolve(exports.rushRootPath, 'common/temp/node_modules');

exports.pushGlobalNodeModules = (module) => {
	module.paths.push(exports.globalNodeModulesPath);
};

exports.pushGlobalNodeModules(module);

const {readFileSync} = require('fs');
const jsonc = require('jsonc');

exports.readJsonSync = (p) => {
	const data = readFileSync(p, 'utf-8');
	return jsonc.parse(data);
};

const p = resolve(__dirname, '../..', 'rush.json');
const f = readFileSync(p, 'utf-8');
const projects = jsonc.parse(f).projects;

const items = exports.items = new Map();

for ({packageName, projectFolder} of projects) {
	items.set(packageName, projectFolder);
}
