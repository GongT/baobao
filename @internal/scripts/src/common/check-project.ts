import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { parse } from 'comment-json';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

import { createLogger, EnableLogLevel, type IMyLogger } from '@idlebox/logger';
import { currentProject } from './constants.js';
import { getExportsField, packageJson } from './package-json.js';

const logger = createLogger('check-project');
logger.enable(EnableLogLevel.verbose);

export const PLUGIN_NAME = 'check-project';

interface ICheck {
	tsconfig: {
		placement: string;
		template: Record<string, any>;
		extends: string;
	};
}

async function executeInner() {
	const project = new ProjectConfig(currentProject, undefined, logger);

	const rigName = project.rigConfig.rigPackageName;
	const rigProfile = project.rigConfig.rigProfile;
	const rigRelPath = project.rigConfig.relativeProfileFolderPath;

	const pkgPath = resolve(currentProject, 'package.json');
	logger.log`check project long<${pkgPath}>`;
	logger.log`  - rig: "${rigName}", profile: "${rigProfile}"`;

	if (project.rigConfig.rigFound && rigName === '@internal/local-rig') {
		logger.success`rig setting is correct`;
	} else {
		logger.fatal`invalid rig, update ${currentProject}/config/rig.json`;
	}

	const rigPath = project.rigConfig.getResolvedProfileFolder();

	const check: ICheck = {
		tsconfig: {},
	} as any;

	check.tsconfig.extends = `${rigName}/${rigRelPath}/tsconfig.json`;
	const physicalPath = realpathSync(resolve(rigPath, 'tsconfig.json'));
	check.tsconfig.template = loadCommentTemplate(physicalPath);
	check.tsconfig.placement = 'src/tsconfig.json';

	const tsconfigPath = resolve(currentProject, check.tsconfig.placement);
	logger.debug`using tsconfig file: long<${tsconfigPath}>`;
	try {
		const data = mustReadJson(tsconfigPath);
		checkJsonConfig(data, check.tsconfig.template, check.tsconfig.extends);
	} catch (e: any) {
		CheckFail.push(
			`tsconfig.json 内容异常:\n    File: ${tsconfigPath}\n    Template: ${physicalPath}\n    Reason: \x1b[38;5;9m${e.message}\x1b[0m\n`,
		);
	}

	if (!packageJson.devDependencies) {
		throw new Error('missing devDependencies in package.json');
	}

	if (!packageJson.devDependencies[rigName]) {
		// this not work (not able to run)
		throw new Error(`devDependencies missing rig package (${rigName})`);
	}
	const assetPkgName = '@build-script/single-dog-asset';
	if (!packageJson.devDependencies[assetPkgName]?.startsWith('workspace:')) {
		throw new Error(`devDependencies missing assets package (${assetPkgName})`);
	}
	logger.debug(`${assetPkgName}: ${packageJson.devDependencies[assetPkgName]}`);

	const others = Object.keys(packageJson.devDependencies)
		.concat(Object.keys(packageJson.dependencies || {}))
		.filter((x) => x.endsWith('-rig') && x !== rigName);

	if (others.length > 0) {
		throw new Error(`dependencies has other rig package (${others.join(', ')})`);
	}

	logger.debug('check exports in package.json');

	const denyFields = ['license', 'author', 'repository', 'typings', 'types', 'main', 'module'];

	requireFieldEquals(logger, ['type'], 'module');
	requireFieldEquals(logger, ['private'], true);
	for (const field of denyFields) {
		requireFieldEquals(logger, [field], undefined);
	}
	requireFieldEquals(logger, ['scripts', 'prepublishHook'], 'internal-prepublish-hook');
	requireFieldEquals(logger, ['scripts', 'lint'], 'internal-lint');

	const usingMpis = usingMpisRun();
	if (usingMpis) {
		logger.debug('using mpis-run');

		const scripts = {
			prepack: 'mpis-run build --clean',
			build: 'mpis-run build',
			watch: 'mpis-run watch',
			clean: 'mpis-run clean',
		};
		for (const [key, value] of Object.entries(scripts)) {
			requireFieldEquals(logger, ['scripts', key], value);
		}
	} else {
		logger.debug('not using mpis-run');
	}

	const autoindex = loadAutoIndex(project);
	const exports = getExportsField();
	if (autoindex) {
		logger.debug`using autoindex: ${autoindex}`;
		check_export_field(logger, 'default', `./lib/${autoindex}.js`);
		if (exports['.']['source']) {
			check_export_field(logger, 'source', `./src/${autoindex}.ts`);
		}
		if (exports['.']['types']) {
			check_export_field(logger, 'types', `./src/${autoindex}.ts`);
		}
	} else if (exports['.']['source']) {
		check_export_field(logger, 'types', exports['.']['source'] as string);
	} else {
		check_export_field(logger, 'types', undefined);
	}
	check_export_field(logger, 'import', undefined);
	check_export_field(logger, 'require', undefined);
}

function usingMpisRun() {
	const scripts = packageJson.scripts || {};
	for (const value of Object.values(scripts)) {
		if (value.startsWith('mpis-run')) {
			return true;
		}
	}
	return false;
}

export async function executeProjectCheck() {
	try {
		await executeInner();

		CheckFail.throwIfErrors(resolve(currentProject, 'package.json'));

		logger.success('check complete!');
	} catch (e: any) {
		if (e instanceof CheckFail) {
			logger.error(`project check failed: ${e.message}`);
		} else {
			logger.fatal`意外错误: long<${e.stack.replace(/^/gm, '    ')}>`;
		}
		process.exitCode = 1;
	}
}

function loadAutoIndex(config: ProjectConfig): string | undefined {
	try {
		const autoindex = config.loadPackageJsonOnly<any>('autoindex');

		const filename = autoindex.output ?? 'autoindex.generated';
		return filename;
	} catch {
		return undefined;
	}
}

class CheckFail extends Error {
	static errors: string[] = [];
	static push(message: string) {
		CheckFail.errors.push(message);
	}
	static throwIfErrors(who: string) {
		if (CheckFail.errors.length > 0) {
			const message = `${CheckFail.errors.length} errors found in ${who}:`;

			const all_errors = CheckFail.errors.join('\n  - ');
			CheckFail.errors = [];
			throw new CheckFail(`${message}\n  - ${all_errors}`);
		}
	}
}

// function lstatFile(file: string) {
// 	try {
// 		const ss = lstatSync(file);
// 		return ss;
// 	} catch (e) {
// 		CheckFail.push(
// 			`missing or unreadable required file:\n    File: ${file}\n  Create it by running "ln -s --relative $(realpath ./node_modules/@build-script/single-dog-asset/package/npmignore) .npmignore"`,
// 		);
// 		return undefined;
// 	}
// }

function assert(cond: boolean, message: string) {
	if (!cond) CheckFail.push(message);
}

function loadCommentTemplate(path: string) {
	const json = parse(readFileSync(path, 'utf-8')) as any;

	const symbols = [Symbol.for('before')];
	const options = json.compilerOptions;
	if (!options) {
		throw new Error(`template file "${path}" has no compilerOptions`);
	}

	for (const prop of Object.keys(options)) {
		symbols.push(Symbol.for(`before:${prop}`), Symbol.for(`after:${prop}`));
	}

	for (const symbol of symbols) {
		const comments = options[symbol];
		if (!comments) continue;

		for (const comment of comments) {
			if (comment.type !== 'BlockComment') continue;

			try {
				return parse(`{\n${comment.value.trim()}\n}`, undefined, true) as Record<string, any>;
			} catch (e: any) {
				throw new Error(`template file "${path}" has ${e.message}`);
			}
		}
	}
	throw new Error(`template file "${path}" has no json block comment`);
}

function mustReadJson(file: string): any {
	const data = readFileSync(file, 'utf-8');
	try {
		return parse(data, undefined, true);
	} catch (e: any) {
		throw new Error(`failed parse json: ${e.message}`);
	}
}

function checkJsonConfig(data: any, template: Record<string, any>, exValue: string) {
	if (data.extends !== exValue) throw new Error(`"extends" must be "${exValue}"`);

	const cop = data.compilerOptions;
	if (!cop) CheckFail.push('missing compilerOptions');

	for (const prop of Object.keys(template)) {
		const expect = template[prop];
		const value = cop[prop];
		if (Array.isArray(expect)) {
			if (!Array.isArray(value)) throw new Error(`property "${prop}" should be array`);
			for (const ele of expect) {
				if (!value.includes(ele)) throw new Error(`property "${prop}" should include ${JSON.stringify(ele)}`);
			}
		} else if (expect !== value) {
			throw new Error(`property "${prop}" should be ${JSON.stringify(expect)}`);
		}
	}
}

function check_export_field(
	logger: IMyLogger,
	exportType: 'require' | 'default' | 'types' | 'source' | 'import',
	want: string | undefined,
) {
	requireFieldEquals(logger, ['exports', '.', exportType], want);
}

function requireFieldEquals(logger: IMyLogger, path: string[], want: string | boolean | undefined) {
	let data = getObjectPathTo(packageJson, path);
	if (want === undefined && data?.actual.length !== path.length) {
		data = { actual: path, value: undefined };
	}
	logger.debug(`  - ${(data?.actual ?? path).join('::')} = ${data?.value}`);
	assert(data?.value === want, `"${path.join('::')}" field must be "${want}", got ${JSON.stringify(data?.value)}`);
}

function getObjectPathTo(pkg: any, path: string[]) {
	const walk = (from: any) => {
		let value = from;
		const actual = [];
		for (const p of path) {
			if (!value[p]) {
				break;
			}
			value = value[p];
			actual.push(p);
		}
		return typeof value !== 'object' ? { value: value as string | undefined, actual } : undefined;
	};

	if (pkg.publishConfig) {
		const over = walk(pkg.publishConfig);
		if (over !== undefined) return over;
	}

	return walk(pkg);
}
