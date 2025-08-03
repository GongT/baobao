import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { parse } from 'comment-json';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { createLogger, EnableLogLevel, type IMyLogger } from '@idlebox/logger';
import { currentProject } from './constants.js';
import { CheckFail, ErrorCollector } from './error-collecter.js';
import { ObjectChecker } from './object-checker.js';
import { getExportsField, packageJson, readPackageJson, writeBack } from './package-json.js';

let errorRegistry: ErrorCollector;
const assetPkgName = '@build-script/single-dog-asset';
const very_basic_packages = ['@build-script/single-dog-asset', '@idlebox/itypes', '@internal/local-rig', '@internal/scripts', '@gongt/pnpm-instead-npm', '@idlebox/ensure-symlink'];

export async function executeProjectCheck() {
	await readPackageJson();

	const logger = createLogger(`check-project:${packageJson.name}`);
	logger.enable(EnableLogLevel.warn);
	errorRegistry = new ErrorCollector(logger);

	try {
		const notices = await executeInner(logger);

		errorRegistry.throwIfErrors();

		logger.success('检查没有问题');
		for (const notice of notices) {
			logger.warn`   long<${notice}>`;
		}
	} catch (e: any) {
		if (!(e instanceof CheckFail)) {
			errorRegistry.with(resolve(currentProject, 'package.json')).emit(`意外错误: ${e.stack}`);
			e = errorRegistry.getError();
		}
		logger.error(`项目检查出错: ${e.message}`);
		await writeBack();
		process.exitCode = 1;
	}
}

function makeProj(logger: IMyLogger) {
	const project = new ProjectConfig(currentProject, undefined, logger);

	const rigName = project.rigConfig.rigPackageName;
	const rigProfile = project.rigConfig.rigProfile;

	logger.debug`  - rig: "${rigName}", profile: "${rigProfile}"`;

	return project;
}

async function executeInner(logger: IMyLogger) {
	const notice: string[] = [];
	const pkgPath = resolve(currentProject, 'package.json');
	logger.debug`check project long<${pkgPath}>`;

	const project = makeProj(logger);
	const pkgChk = new ObjectChecker(logger, errorRegistry.with(pkgPath), packageJson);

	if (project.rigConfig.rigFound && project.rigConfig.rigPackageName === '@internal/local-rig') {
		logger.log`rig setting is correct`;

		await checkTsConfig(project, logger);
	} else if (very_basic_packages.includes(packageJson.name)) {
		// no need
	} else {
		errorRegistry.with(`${currentProject}/config/rig.json`).emit(`invalid rig setting`);
		return notice;
	}

	pkgChk.hasField(['devDependencies']);
	if (!very_basic_packages.includes(assetPkgName)) {
		if (project.rigConfig.rigPackageName !== packageJson.name) {
			pkgChk.hasField(['devDependencies', project.rigConfig.rigPackageName]);
		}
		pkgChk.hasField(['devDependencies', assetPkgName]);
		logger.debug(`${assetPkgName}: ${packageJson.devDependencies[assetPkgName]}`);
	}

	const others = Object.keys(packageJson.devDependencies)
		.concat(Object.keys(packageJson.dependencies || {}))
		.filter((x) => x.endsWith('-rig') && x !== project.rigConfig.rigPackageName);

	if (others.length > 0) {
		pkgChk.error.emit(`dependencies 存在其他 rig包 (${others.join(', ')})`);
	}

	logger.debug('check exports in package.json');

	const denyFields = ['license', 'author', 'repository', 'typings', 'types', 'main', 'module'];

	pkgChk.equals(['type'], 'module');

	pkgChk.not_exists(['private']);
	pkgChk.equals(['scripts', 'prepublishOnly'], 'internal-prepublish-deny');
	pkgChk.equals(['scripts', 'prepublishHook'], 'internal-prepublish-hook');
	pkgChk.equals(['scripts', 'lint'], 'internal-lint');

	for (const field of denyFields) {
		pkgChk.not_exists([field]);
	}

	pkgChk.equals(['publishConfig', 'pack-command'], undefined);
	pkgChk.equals(['publishConfig', 'packCommand', 0], 'publisher');
	pkgChk.equals(['publishConfig', 'packCommand', 1], 'pack');

	const usingMpis = usingMpisRun();
	if (usingMpis) {
		logger.debug('using mpis-run');

		const scripts = {
			prepublishOnly: 'internal-prepublish-deny',
			prepack: 'mpis-run build --clean',
			build: 'mpis-run build',
			watch: 'mpis-run watch',
			clean: 'mpis-run clean',
		};
		for (const [key, value] of Object.entries(scripts)) {
			pkgChk.equals(['scripts', key], value);
		}
	} else {
		notice.push(`不使用 mpis-run`);
		logger.debug('not using mpis-run');
	}

	const autoindex = loadAutoIndex(project);
	const exports = getExportsField();
	if (autoindex) {
		logger.debug`using autoindex: ${autoindex}`;
		check_export_field(pkgChk, 'default', `./lib/${autoindex}.js`);
		if (exports['.']?.['source']) {
			check_export_field(pkgChk, 'source', `./src/${autoindex}.ts`);
		}
		if (exports['.']?.['types']) {
			check_export_field(pkgChk, 'types', `./src/${autoindex}.ts`);
		}
	} else if (exports['.']?.['source']) {
		check_export_field(pkgChk, 'types', exports['.']['source'] as string);
	} else {
		check_export_field(pkgChk, 'types', undefined);
	}

	if (exports['.']) {
		pkgChk.exists(['exports', '.', 'default']);
	}

	check_export_field(pkgChk, 'import', undefined);
	check_export_field(pkgChk, 'require', undefined);

	return notice;
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

function loadAutoIndex(config: ProjectConfig): string | undefined {
	try {
		const autoindex = config.loadPackageJsonOnly<any>('autoindex');

		const filename = autoindex.output ?? 'autoindex.generated';
		return filename;
	} catch {
		return undefined;
	}
}

async function checkTsConfig(project: ProjectConfig, logger: IMyLogger) {
	const rigPath = project.rigConfig.getResolvedProfileFolder();

	const tsconfigPath = resolve(currentProject, 'src/tsconfig.json');
	logger.debug`using tsconfig file: long<${tsconfigPath}>`;

	const data = await readJsonOut(tsconfigPath);
	if (!data) {
		return;
	}

	const errorObject = errorRegistry.with(tsconfigPath);

	const templateFile = realpathSync(resolve(rigPath, 'tsconfig.json'));
	errorObject.addon(`模板: ${templateFile}`);
	const templateOptions = loadCommentTemplate(templateFile);

	const checker = new ObjectChecker(logger, errorObject, data);

	const extendsValue = `${project.rigConfig.rigPackageName}/${project.rigConfig.relativeProfileFolderPath}/tsconfig.json`;
	checker.equals(['extends'], extendsValue);

	for (const [field, value] of Object.entries(templateOptions)) {
		if (Array.isArray(value)) {
			for (const [index, item] of value.entries()) {
				checker.equals(['compilerOptions', field, index], item);
			}
		} else {
			checker.equals(['compilerOptions', field], value);
		}
	}

	await writeJsonFileBack(data);
}

function loadCommentTemplate(path: string) {
	const json = parse(readFileSync(path, 'utf-8')) as any;

	const symbols = [Symbol.for('before')];
	const options = json.compilerOptions;
	if (!options) {
		throw errorRegistry.with(path).emit(`template file no compilerOptions`);
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
				throw errorRegistry.with(path).emit(`template file: ${e.message}`);
			}
		}
	}
	throw errorRegistry.with(path).emit(`template file has no json block comment`);
}

async function readJsonOut(file: string) {
	try {
		return await loadJsonFile(file, 'utf-8');
	} catch (e: any) {
		errorRegistry.with(file).emit(`failed read or parse json: ${e.message}`);
		return undefined;
	}
}

function check_export_field(check: ObjectChecker, exportType: 'require' | 'default' | 'types' | 'source' | 'import', want: string | undefined) {
	check.equals(['exports', '.', exportType], want);
}
