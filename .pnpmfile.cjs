const { resolve, basename } = require('path');
const { readFileSync } = require('fs');

const PROJECT_ROOT = resolve(__dirname, '../../..');
const myProjects = new Set();
const knownTypesVersion = {};

module.exports = {
	hooks: {
		readPackage,
	},
};

function init() {
	const { spawnSync } = require('child_process');
	const result = spawnSync(process.argv0, [require.main.filename, 'pnpm', 'm', 'ls', '--json', '--depth=-1'], {
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
		myProjects.add(val.name);

		for (const [name, version] of Object.entries({ ...val.dependencies, ...val.devDependencies })) {
			if (name.startsWith('@types/')) {
				knownTypesVersion[name] = version;
			}
		}
	}
}

function forceBreakDependencyLoop(rigPkg) {
	const deps = [
		'@build-script/heft-autoindex-plugin',
		'@build-script/heft-cls-plugin',
		'@build-script/heft-codegen-plugin',
		'@build-script/heft-shell-plugin',
		'@build-script/heft-plugin-base',
		'@build-script/heft-source-map-plugin',
		'@build-script/heft-typescript-plugin',
		'@build-script/single-dog-asset',
	];
	for (const dep of deps) {
		rigPkg.dependencies[dep] = 'workspace:^';
	}
}

function readPackage(packageJson, context) {
	if (myProjects.size === 0) init();

	if (packageJson.name === '@internal/local-rig') {
		forceBreakDependencyLoop(packageJson);
	}

	const v = packageJson.dependencies?.['@gongt/fix-esm'];
	if (v && !v.startsWith('workspace:')) {
		console.error('replace fix-esm version from %s to local file', v);
		packageJson.dependencies['@gongt/fix-esm'] = resolve(PROJECT_ROOT, '@gongt/fix-esm');
	}

	if (myProjects.has(packageJson.name)) return packageJson;

	if (packageJson.dependencies) lockDep(packageJson.dependencies, context);
	// if (packageJson.devDependencies) lockDep(packageJson.devDependencies, context);

	if (packageJson.peerDependencies) delete packageJson.peerDependencies;

	return packageJson;
}

function lockDep(deps, context) {
	for (const [name, version] of Object.entries(deps)) {
		if (!name.startsWith('@types/')) continue;

		if (knownTypesVersion[name]) {
			deps[name] = knownTypesVersion[name];
		} else {
			knownTypesVersion[name] = version;
		}
	}
}

function loadJsonSync(f) {
	return JSON.parse(readFileSync(f, 'utf-8'));
}
