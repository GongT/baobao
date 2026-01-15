const { resolve, basename } = require('node:path');
const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

// const PROJECT_ROOT = resolve(__dirname, '../../..');
const myProjects = new Set();
const knownTypesVersion = {};

module.exports = {
	hooks: {
		// preResolution,
		readPackage,
	},
};

if (process.env.PNPM_CALL_RECURSIVE) {
	module.exports.hooks = {};
}

let inited = false;
function init() {
	if (inited) return;
	inited = true;

	const cmds = [];
	cmds.push(process.execPath);
	if (!process.execPath.includes('/@pnpm/')) {
		cmds.push(require.main.filename);
	}
	cmds.push('multi', 'ls', '--json', '--depth=-1');
	console.error(`\x1B[2m+ ${cmds.join(' ')}\x1B[0m`);
	const result = spawnSync(cmds[0], cmds.slice(1), {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
		env: {
			PNPM_CALL_RECURSIVE: '1',
		},
	});
	if (result.error) {
		throw result.error;
	}

	const output = result.stdout.toString().trim();

	try {
		JSON.parse(output);
	} catch (e) {
		throw new Error(`pnpm ls输出不是json (${e.message})\n---------------------------------\n${output}\n---------------------------------`);
	}
	const projects = JSON.parse(output);

	console.error('\x1B[38;5;10m[%s]: there are %d projects in workspace.\x1B[0m', basename(__filename), projects.length);

	for (const { path, name } of projects) {
		if (!name) continue;

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
	init();

	if (packageJson.name === '@internal/local-rig') {
		addEverythingToDependency(packageJson);
	}

	if (packageJson.name === '@rollup/plugin-swc') {
		packageJson.dependencies['@swc/core'] = 'latest';
	}

	if (myProjects.has(packageJson.name) || packageJson._example) {
		return addNodejsShimTypes(packageJson);
	}

	if (packageJson.dependencies) lockDep(packageJson.dependencies, context);
	if (packageJson.devDependencies) lockDep(packageJson.devDependencies, context);

	if (packageJson.peerDependencies) packageJson.peerDependencies = undefined;

	return packageJson;
}

function addNodejsShimTypes(packageJson) {
	if (findDep(packageJson, '@types/node')) {
		if (packageJson.dependencies['@types/node']) {
			console.error('\x1B[38;5;11m[%s] @types/node in dependencies.\x1B[0m', packageJson.name);
		}
	} else {
		if (!packageJson.devDependencies) packageJson.devDependencies = {};
		packageJson.devDependencies['@types/node'] = 'workspace:@idlebox/itypes@*';
	}

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

function findDep(packageJson, name) {
	const dep = packageJson.dependencies?.[name];
	if (dep) return dep;

	return packageJson.devDependencies?.[name];
}
