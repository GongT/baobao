import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { ProjectConfigurationFile } from '@rushstack/heft-config-file';
import { parse } from 'comment-json';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';

export const PLUGIN_NAME = 'check-project';

interface ICheck {
	tsconfig: {
		placement: string;
		template: Record<string, any>;
		extends: string;
	};
}

const tsExtension = /\.ts$/;

export default class CheckProjectPlugin implements IHeftTaskPlugin {
	private executeInner(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const rigPath = configuration.rigConfig.getResolvedProfileFolder();
		const rigName = configuration.rigConfig.rigPackageName;
		const rigProfile = configuration.rigConfig.rigProfile;
		const rigRelPath = configuration.rigConfig.relativeProfileFolderPath;
		session.logger.terminal.writeLine(`check project "${configuration.projectPackageJson.name}"`);
		session.logger.terminal.writeLine(`  - rig: "${rigName}", profile: "${rigProfile}"`);

		if (rigName === '@internal/local-rig') {
			session.logger.terminal.writeDebugLine('check simple project');
		} else {
			throw new Error(`update ${__filename}`);
		}

		const check: ICheck = {
			tsconfig: {},
		} as any;

		check.tsconfig.extends = `${rigName}/${rigRelPath}/tsconfig.json`;
		const physicalPath = realpathSync(resolve(rigPath, 'tsconfig.json'));
		check.tsconfig.template = loadCommentTemplate(physicalPath);
		check.tsconfig.placement = 'src/tsconfig.json';

		const tsconfigPath = resolve(configuration.buildFolderPath, check.tsconfig.placement);
		try {
			const data = mustReadJson(tsconfigPath);
			session.logger.terminal.writeDebugLine('check tsconfig.json');
			checkJsonConfig(data, check.tsconfig.template, check.tsconfig.extends);
		} catch (e: any) {
			CheckFail.push(
				`file content verify failed:\n    File: ${tsconfigPath}\n    Template: ${physicalPath}\n    Reason: \x1b[38;5;9m${e.message}\x1b[0m\n`
			);
		}

		const pkgPath = resolve(configuration.buildFolderPath, 'package.json');
		try {
			const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
			if (!pkg.devDependencies) {
				throw new Error('missing devDependencies in package.json');
			}

			if (!pkg.devDependencies[rigName]) {
				// this not work (not able to run)
				throw new Error(`devDependencies missing rig package (${rigName})`);
			}
			const assetPkgName = '@build-script/single-dog-asset';
			if (!pkg.devDependencies[assetPkgName]?.startsWith('workspace:')) {
				throw new Error(`devDependencies missing assets package (${assetPkgName})`);
			}
			session.logger.terminal.writeDebugLine(`${assetPkgName}: ${pkg.devDependencies[assetPkgName]}`);

			const others = Object.keys(pkg.devDependencies)
				.concat(Object.keys(pkg.dependencies || {}))
				.filter((x) => x.endsWith('-rig') && x !== rigName);

			if (others.length > 0) {
				throw new Error(`dependencies has other rig package (${others.join(', ')})`);
			}

			session.logger.terminal.writeDebugLine('check exports in package.json');

			requireFieldEquals(session.logger, pkg, ['typings'], undefined);

			if (rigName === '@internal/local-rig') {
				const checked = check_exports_correctly_set_to_index(session, configuration, pkg);

				if (!checked) {
					const is_dual = rigProfile === 'dualstack';
					const is_cjs = rigProfile === 'commonjs';

					if (is_dual) {
						requireFieldEquals(session.logger, pkg, ['type'], 'module');

						if (pkg.module) check_export_field(session.logger, pkg, 'default', pkg.module);
						if (pkg.main) check_export_field(session.logger, pkg, 'require', pkg.main);
						if (pkg.types) check_export_field(session.logger, pkg, 'types', pkg.types);
					} else {
						requireFieldEquals(session.logger, pkg, ['types'], undefined);
						check_export_field(session.logger, pkg, 'types', undefined);
						check_export_field(session.logger, pkg, 'require', undefined);

						if (is_cjs) {
							requireFieldEquals(session.logger, pkg, ['type'], 'commonjs');
						} else {
							requireFieldEquals(session.logger, pkg, ['type'], 'module');
						}

						requireFieldEquals(session.logger, pkg, ['module'], undefined);
						if (pkg.main) check_export_field(session.logger, pkg, 'default', pkg.main);
					}
				}
			}
		} catch (e: any) {
			CheckFail.push(`意外错误: ${e.message}`);
		}

		const npmignore = lstatFile(resolve(configuration.buildFolderPath, '.npmignore'));
		assert(npmignore?.isSymbolicLink() ?? true, 'file must be symbolic link: .npmignore');

		CheckFail.throwIfErrors(pkgPath);

		session.logger.terminal.writeLine('check complete!');
	}
	private async execute(session: IHeftTaskSession, configuration: HeftConfiguration) {
		try {
			await this.executeInner(session, configuration);
		} catch (e: any) {
			if (e instanceof CheckFail) {
				session.logger.emitError(new Error(`project check failed: ${e.message}`));
			} else {
				session.logger.terminal.writeErrorLine('plugin internal error!');
				session.logger.terminal.writeErrorLine(e.stack.replace(/^/gm, '    '));
				session.logger.emitError(e);
			}
		}
	}

	apply(session: IHeftTaskSession, configuration: HeftConfiguration, _options?: undefined): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, () => this.execute(session, configuration));
	}
}

function loadAutoIndex(session: IHeftTaskSession, configuration: HeftConfiguration): string | undefined {
	const config = new ProjectConfigurationFile<{ filename?: string }>({
		projectRelativeFilePath: 'config/autoindex.json',
		jsonSchemaObject: {},
	});
	const autoindex = config.tryLoadConfigurationFileForProject(
		session.logger.terminal,
		configuration.buildFolderPath,
		configuration.rigConfig
	);
	if (!autoindex) return undefined;

	let filename = autoindex.filename ?? './src/__create_index.generated.ts';
	if (!filename.startsWith('./')) {
		filename = `./${filename}`;
	}
	return filename;
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

function lstatFile(file: string) {
	try {
		const ss = lstatSync(file);
		return ss;
	} catch (e) {
		CheckFail.push(
			`missing or unreadable required file:\n    File: ${file}\n  Create it by running "ln -s --relative $(realpath ./node_modules/@build-script/single-dog-asset/package/npmignore) .npmignore"`
		);
	}
}

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

function check_exports_correctly_set_to_index(session: IHeftTaskSession, configuration: HeftConfiguration, pkg: any) {
	const rigProfile = configuration.rigConfig.rigProfile;

	const is_dual = rigProfile === 'dualstack';
	const is_cjs = rigProfile === 'commonjs';

	const index_should_be = loadAutoIndex(session, configuration);
	if (index_should_be) {
		check_export_field(session.logger, pkg, 'source', index_should_be);
		check_export_field(session.logger, pkg, 'import', undefined);

		const cjs = index_should_be.replace('/src/', '/lib/cjs/').replace(tsExtension, '.cjs');
		const esm = index_should_be.replace('/src/', '/lib/esm/').replace(tsExtension, '.js');
		if (is_dual) {
			const typ = index_should_be.replace('/src/', '/lib/esm/').replace(tsExtension, '.d.ts');

			check_export_field(session.logger, pkg, 'require', cjs);
			check_export_field(session.logger, pkg, 'default', esm);
			check_export_field(session.logger, pkg, 'types', typ);

			requireFieldEquals(session.logger, pkg, ['type'], 'module');
			requireFieldEquals(session.logger, pkg, ['main'], cjs);
			requireFieldEquals(session.logger, pkg, ['module'], esm);

			requireFieldEquals(session.logger, pkg, ['types'], typ);
		} else if (is_cjs) {
			check_export_field(session.logger, pkg, 'require', undefined);
			check_export_field(session.logger, pkg, 'default', cjs);
			check_export_field(session.logger, pkg, 'types', undefined);

			requireFieldEquals(session.logger, pkg, ['type'], 'commonjs');
			requireFieldEquals(session.logger, pkg, ['main'], cjs);
			requireFieldEquals(session.logger, pkg, ['module'], undefined);

			requireFieldEquals(session.logger, pkg, ['types'], undefined);
		} else {
			check_export_field(session.logger, pkg, 'require', undefined);
			check_export_field(session.logger, pkg, 'default', esm);
			check_export_field(session.logger, pkg, 'types', undefined);

			requireFieldEquals(session.logger, pkg, ['type'], 'module');
			requireFieldEquals(session.logger, pkg, ['main'], esm);
			requireFieldEquals(session.logger, pkg, ['module'], undefined);

			requireFieldEquals(session.logger, pkg, ['types'], undefined);
		}
	}

	return !!index_should_be; // return true if autoindex is enabled
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
	logger: IScopedLogger,
	pkg: any,
	exportType: 'require' | 'default' | 'types' | 'source' | 'import',
	want: string | undefined
) {
	requireFieldEquals(logger, pkg, ['exports', '.', exportType], want);
}

function requireFieldEquals(logger: IScopedLogger, pkg: any, path: string[], want: string | undefined) {
	let data = getObjectPathTo(pkg, path);
	if (want === undefined && data?.actual.length !== path.length) {
		data = { actual: path, value: undefined };
	}
	logger.terminal.writeDebugLine(`  - ${(data?.actual ?? path).join('::')} = ${data?.value}`);
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
		return typeof value === 'string' ? { value: value as string | undefined, actual } : undefined;
	};

	if (pkg.publishConfig) {
		const over = walk(pkg.publishConfig);
		if (over !== undefined) return over;
	}

	return walk(pkg);
}
