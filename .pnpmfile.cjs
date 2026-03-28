const { resolve, basename } = require('node:path');
const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert');

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
		assert.ok(packageJson.peerDependencies['@swc/core']);
		packageJson.dependencies['@swc/core'] = packageJson.peerDependencies['@swc/core'];
	}

	if (myProjects.has(packageJson.name) || packageJson._example) {
		for (const name of Object.keys(packageJson.dependencies || {})) {
			if (name === '@types/source-map-support') continue;

			if (name.startsWith('@types/')) {
				throw new Error(`\x1B[38;5;11m[${packageJson.name}] "${name}" is in production dependencies.\x1B[0m`);
			}
		}
		addNodejsShimTypes(packageJson);

		if (packageJson.bin && packageJson.name !== '@idlebox/native-executer') {
			packageJson.devDependencies['@idlebox/native-executer'] = 'workspace:^';
		}

		return packageJson;
	}

	if (packageJson.dependencies) lockDep(packageJson.dependencies, context);
	if (packageJson.devDependencies) lockDep(packageJson.devDependencies, context);

	if (packageJson.peerDependencies) packageJson.peerDependencies = undefined;

	return packageJson;
}

const veryBasicProjects = ['@internal/local-rig', '@internal/scripts', '@idlebox/itypes', '@build-script/baseline-rig'];
function addNodejsShimTypes(packageJson) {
	if (!packageJson.devDependencies) packageJson.devDependencies = {};

	let resolvedVersion, itypesKind;
	const nodejsTypesVer = findDep(packageJson, '@types/node');
	const webTypesVer = findDep(packageJson, '@types/web');
	if (veryBasicProjects.includes(packageJson.name)) {
		return packageJson;
	} else if (nodejsTypesVer) {
		// 项目依赖nodejs环境
		if (!nodejsTypesVer.startsWith('^')) throw new Error(`\x1B[38;5;11m[${packageJson.name}] "@types/node" version should start with "^".\x1B[0m`);

		resolvedVersion = `npm:@types/node@${nodejsTypesVer}`;
		itypesKind = `node`;
	} else if (webTypesVer) {
		// 项目依赖web/DOM环境
		if (!webTypesVer.startsWith('^')) throw new Error(`\x1B[38;5;11m[${packageJson.name}] "@types/web" version should start with "^".\x1B[0m`);

		delete packageJson.devDependencies['@types/web'];
		resolvedVersion = `npm:@types/web@${webTypesVer}`;
		itypesKind = `dom`;
	} else {
		// 纯js库，不依赖任何运行时环境
		resolvedVersion = `workspace:@idlebox/empty@^`;
		itypesKind = `bare`;
	}
	itypesKind = `workspace:@idlebox/itypes-${itypesKind}@^`;

	if (webTypesVer && nodejsTypesVer) {
		throw new Error(`\x1B[38;5;11m[${packageJson.name}] should not depend on both "@types/node" and "@types/web".\x1B[0m`);
	}

	// if (findDep(packageJson, '@idlebox/itypes')) {
	// 	// 已经依赖了 @idlebox/itypes，说明它不依赖任何特定环境
	// 	// 实际只有 @idlebox/common 一个包是这种情况
	// 	resolvedVersion = `workspace:@idlebox/empty@^`;
	// 	itypesKind = `workspace:@idlebox/empty@^`;
	// }

	// 所有可以加载的地方全替换，防止第三方依赖安装了不兼容的版本
	packageJson.devDependencies['@typescript/lib-dom'] = resolvedVersion;
	packageJson.devDependencies['@types/node'] = resolvedVersion;

	// 实际只生效（期望）
	packageJson.devDependencies['@types/platform'] = resolvedVersion;
	packageJson.devDependencies['@types/itypes'] = itypesKind;

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
