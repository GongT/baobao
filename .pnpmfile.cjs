const { resolve, basename } = require('node:path');
const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

// const PROJECT_ROOT = resolve(__dirname, '../../..');
const myProjects = new Set();
const knownTypesVersion = {};

module.exports = {
	hooks: {
		readPackage,
	},
};

function init() {
	const cmds = [process.argv0, require.main.filename, 'multi', 'ls', '--json', '--depth=-1'];
	console.error(`\x1B[2m+ ${cmds.join(' ')}\x1B[0m`);
	const result = spawnSync(cmds[0], cmds.slice(1), {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	if (result.error) {
		throw result.error;
	}
	const projects = JSON.parse(result.stdout);

	console.log('\x1B[38;5;10m[%s]: there are %d projects in workspace.\x1B[0m', basename(__filename), projects.length);

	for (const { path } of projects) {
		const p = resolve(path, 'package.json');
		const val = loadJsonSync(p);
		if (val.name) {
			myProjects.add(val.name);
		}

		for (const [name, version] of Object.entries({ ...val.dependencies, ...val.devDependencies })) {
			if (name.startsWith('@types/')) {
				knownTypesVersion[name] = version;
			}
		}
	}
}

function addEverythingToDependency(rigPkg) {
	for (const name of myProjects.values()) {
		if (name === rigPkg.name) continue;
		rigPkg.devDependencies[name] = 'workspace:^';
	}
}

function readPackage(packageJson, context) {
	if (myProjects.size === 0) init();

	if (packageJson.name === '@internal/local-rig') {
		addEverythingToDependency(packageJson);
	}

	if (myProjects.has(packageJson.name)) return packageJson;

	if (packageJson.dependencies) lockDep(packageJson.dependencies, context);
	if (packageJson.devDependencies) lockDep(packageJson.devDependencies, context);

	if (packageJson.peerDependencies) packageJson.peerDependencies = undefined;

	return packageJson;
}

function lockDep(deps, _context) {
	for (const [name, version] of Object.entries(deps)) {
		if (name.startsWith('@types/')) {
			if (knownTypesVersion[name]) {
				deps[name] = knownTypesVersion[name];
			} else {
				knownTypesVersion[name] = version;
			}
		}
	}
}

function loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}
