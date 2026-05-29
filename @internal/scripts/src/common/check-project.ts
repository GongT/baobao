import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { Assertion } from '@idlebox/common';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { createLogger, EnableLogLevel, type IMyLogger } from '@idlebox/logger';
import { parse } from 'comment-json';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { CheckFail, ErrorCollector } from './error-collecter.js';
import { formatFile } from './format.js';
import { ObjectChecker } from './object-checker.js';
import { getExportsField, packageJson, readPackageJson, writeBackPackageJson } from './package-json.js';
import { currentProject } from './paths/current.js';
import { executePreBuild } from './steps.js';

let errorRegistry: ErrorCollector;
const assetPkgName = '@build-script/baseline-rig';
const very_basic_packages = [assetPkgName, '@internal/local-rig', '@internal/scripts', '@gongt/pnpm-instead-npm', '@idlebox/ensure-symlink', '@idlebox/empty'];

export async function executeProjectCheck() {
	await readPackageJson();

	const logger = createLogger(`check-project:${packageJson.name}`);
	logger.enable(EnableLogLevel.warn);
	errorRegistry = new ErrorCollector(logger);

	try {
		const notices = await executeInner(logger);

		const failed = await executePreBuild(false);
		if (failed) {
			errorRegistry.with(resolve(currentProject, 'package.json')).emit('check failed');
		}

		errorRegistry.throwIfErrors();

		logger.success('检查没有问题\n\n');
		for (const notice of notices) {
			logger.warn`   long<${notice}>`;
		}
	} catch (e: any) {
		let ee: CheckFail;
		if (e instanceof CheckFail) {
			ee = e;
		} else {
			errorRegistry.with(resolve(currentProject, 'package.json')).emit(`意外错误: ${e.stack}`);
			const eee = errorRegistry.getError();
			Assertion.ok(eee, '不可能发生: 添加错误后获取错误失败');
			ee = eee;
		}
		logger.error(`项目检查出错: ${ee.message}`);
		process.exitCode = 1;
	}
	await writeBackPackageJson();
}

function makeProj(logger: IMyLogger) {
	const project = new ProjectConfig(currentProject, undefined, logger);

	const rigName = project.rigConfig.rigPackageName;
	const rigProfile = project.rigConfig.rigProfile;

	logger.debug`  - rig: "${rigName}", profile: "${rigProfile}"`;

	return project;
}

function checkVeryBasic(name: string) {
	return very_basic_packages.includes(name) || name.startsWith('@idlebox/itypes');
}

async function executeInner(logger: IMyLogger) {
	const notice: string[] = [];
	const pkgPath = resolve(currentProject, 'package.json');
	logger.debug`检查项目: long<${pkgPath}>`;
	const isVeryBasic = checkVeryBasic(packageJson.name);

	const project = makeProj(logger);
	const error = errorRegistry.with(pkgPath);
	const pkgChk = new ObjectChecker(logger, error, packageJson);

	logger.debug(`rig: ${project.rigConfig.rigPackageName}, profile: ${project.rigConfig.rigProfile}`);
	if (project.rigConfig.rigFound && project.rigConfig.rigPackageName === '@internal/local-rig') {
		logger.log`rig 设置正确`;

		await checkTsConfig(project, logger);
	} else if (isVeryBasic) {
		// no need
	} else {
		errorRegistry.with(`${currentProject}/config/rig.json`).emit(`rig 设置无效`);
		return notice;
	}

	if (project.rigConfig.rigPackageName === packageJson.name) {
		pkgChk.equals(['devDependencies', assetPkgName], 'workspace:^');
	} else if (!isVeryBasic) {
		pkgChk.equals(['devDependencies', project.rigConfig.rigPackageName], 'workspace:^');
		pkgChk.not_exists(['devDependencies', assetPkgName]);
	}

	if (packageJson.devDependencies) {
		const others = Object.keys(packageJson.devDependencies)
			.concat(Object.keys(packageJson.dependencies || {}))
			.filter((x) => x.endsWith('-rig') && x !== project.rigConfig.rigPackageName);

		if (others.length > 0) {
			pkgChk.error.emit(`dependencies 存在其他 rig 包 (${others.join(', ')})`);
		}
	}

	logger.debug('检查 package.json 中的 exports');

	const denyFields = ['license', 'author', 'repository', 'typings', 'main', 'module'];
	if (!packageJson.name.startsWith('@idlebox/itypes-')) {
		denyFields.push('types');
	}

	pkgChk.equals(['type'], 'module');

	// pkgChk.not_exists(['private']);
	pkgChk.equals(['scripts', 'prepublishOnly'], 'internal-prepublish-deny');
	pkgChk.equals(['scripts', 'prepublishHook'], 'internal-prepublish-hook');
	pkgChk.equals(['scripts', 'lint'], 'internal-lint');

	for (const field of denyFields) {
		pkgChk.not_exists([field]);
	}

	pkgChk.equals(['publishConfig', 'pack-command'], undefined);
	pkgChk.equals(['publishConfig', 'packCommand', 0], 'publisher');
	pkgChk.equals(['publishConfig', 'packCommand', 1], 'pack');

	if (!packageJson.sideEffects) {
		pkgChk.equals(['sideEffects'], false);
	}

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
		logger.debug('不使用 mpis-run');
	}

	const autoindex = loadAutoIndex(project);
	const exports = getExportsField();
	if (autoindex) {
		logger.debug`使用 autoindex: ${autoindex}`;
		check_export_field(pkgChk, 'default', `./lib/${autoindex}.js`);
		if (exports['.']?.['source']) {
			check_export_field(pkgChk, 'source', `./src/${autoindex}.ts`);
		}
	}

	for (const [path, define] of Object.entries(exports)) {
		if (define && typeof define === 'object' && define['source']) {
			pkgChk.equals(['exports', path, 'types'], define['source'] as string);
		}
	}

	if (!isVeryBasic) {
		if (!packageJson.exports && !packageJson.bin) {
			error.emit(`exports 和 bin 至少需要存在一个`);
		}
		if (!packageJson.bin) {
			pkgChk.exists(['exports', '.', 'default']);
		}
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
	logger.debug`使用 tsconfig 文件: long<${tsconfigPath}>`;

	const data = await readJsonOut(tsconfigPath);
	if (!data) {
		return;
	}

	const errorObject = errorRegistry.with(tsconfigPath);

	const templateFile = realpathSync(resolve(rigPath, 'tsconfig.json'));
	errorObject.addon(`模板: ${templateFile}`);
	const templateOptions = loadCommentTemplate(templateFile);

	const checker = new ObjectChecker(logger, errorObject, data);

	const extendsBaseValue = `${project.rigConfig.rigPackageName}/${project.rigConfig.relativeProfileFolderPath}`;
	checker.equals(['extends'], [`${extendsBaseValue}/tsconfig.json`, `${extendsBaseValue}/tsconfig.node.json`, `${extendsBaseValue}/tsconfig.web.json`]);

	for (const [field, value] of Object.entries(templateOptions)) {
		if (Array.isArray(value)) {
			for (const [index, item] of value.entries()) {
				checker.equals(['compilerOptions', field, index], item);
			}
		} else {
			checker.equals(['compilerOptions', field], value);
		}
	}

	const ch = await writeJsonFileBack(data);
	await formatFile(tsconfigPath);

	logger.success`写入 tsconfig.json | ${ch ? '有改动' : '没有改动'}`;
}

function loadCommentTemplate(path: string) {
	const json = parse(readFileSync(path, 'utf-8')) as any;

	const symbols = [Symbol.for('before')];
	const options = json.compilerOptions;
	if (!options) {
		throw errorRegistry.with(path).emit(`模板文件缺少 compilerOptions`);
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
				throw errorRegistry.with(path).emit(`模板文件解析错误: ${e.message}`);
			}
		}
	}
	throw errorRegistry.with(path).emit(`模板文件缺少 JSON 块注释`);
}

async function readJsonOut(file: string) {
	try {
		return await loadJsonFile(file, 'utf-8');
	} catch (e: any) {
		errorRegistry.with(file).emit(`读取或解析 JSON 失败: ${e.message}`);
		return undefined;
	}
}

function check_export_field(check: ObjectChecker, exportType: 'require' | 'default' | 'types' | 'source' | 'import', want: string | undefined) {
	check.equals(['exports', '.', exportType], want);
}
