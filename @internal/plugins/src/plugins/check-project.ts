import type { HeftConfiguration, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { IHeftTaskPlugin } from '@rushstack/heft';
import { parse } from 'comment-json';
import { lstat, readFile, realpath } from 'fs/promises';
import { resolve } from 'path';

export const PLUGIN_NAME = 'check-project';

interface ICheck {
	tsconfig: {
		placement: string;
		template: Record<string, any>;
		extends: string;
	};
}

export default class CheckProjectPlugin implements IHeftTaskPlugin {
	private async executeInner(session: IHeftTaskSession, configuration: HeftConfiguration) {
		const rigPath = configuration.rigConfig.getResolvedProfileFolder();
		const rigName = configuration.rigConfig.rigPackageName;
		const rigProfile = configuration.rigConfig.rigProfile;
		const rigRelPath = configuration.rigConfig.relativeProfileFolderPath;
		session.logger.terminal.writeLine(`check project "${configuration.projectPackageJson.name}"`);
		session.logger.terminal.writeLine(`  - rig: "${rigName}", profile: "${rigProfile}"`);

		if (rigName === '@internal/local-rig') {
			session.logger.terminal.writeDebugLine('check simple project');
		} else {
			throw new Error('update ' + __filename);
		}

		const check: ICheck = {
			tsconfig: {},
		} as any;

		check.tsconfig.extends = `${rigName}/${rigRelPath}/tsconfig.json`;
		const physicalPath = await realpath(resolve(rigPath, 'tsconfig.json'));
		check.tsconfig.template = await loadCommentTemplate(physicalPath);
		check.tsconfig.placement = 'src/tsconfig.json';

		const tsconfigPath = resolve(configuration.buildFolderPath, check.tsconfig.placement);
		try {
			const data = await mustReadJson(tsconfigPath);
			session.logger.terminal.writeDebugLine('check tsconfig.json');
			checkJsonConfig(data, check.tsconfig.template, check.tsconfig.extends);
		} catch (e: any) {
			CheckFail.th(
				`file content verify failed:\n    File: ${tsconfigPath}\n    Template: ${physicalPath}\n    Reason: \x1b[38;5;9m${e.message}\x1b[0m\n`,
			);
		}

		const pkgPath = resolve(configuration.buildFolderPath, 'package.json');
		try {
			const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
			if (!pkg.devDependencies) {
				throw new Error(`missing devDependencies in package.json`);
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

			let kind, main, module, typings;
			if (rigName === '@internal/local-rig') {
				const is_autoindex = configuration.rigConfig.tryResolveConfigFilePath('config/autoindex.json');
				const is_dual = rigProfile === 'dualstack';
				const is_cjs = rigProfile === 'commonjs';

				if (is_dual) {
					main = is_autoindex
						? './lib/cjs/__create_index.generated.cjs'
						: getObjectPathTo(pkg, ['main'])?.value;
					module = is_autoindex
						? './lib/esm/__create_index.generated.js'
						: getObjectPathTo(pkg, ['module'])?.value;
					typings = is_autoindex
						? './lib/esm/__create_index.generated.d.ts'
						: getObjectPathTo(pkg, ['types'])?.value;
					kind = 'module';
				} else if (is_cjs) {
					main = is_autoindex ? './lib/__create_index.generated.js' : getObjectPathTo(pkg, ['main'])?.value;
					kind = 'commonjs';
				} else {
					module = is_autoindex
						? './lib/__create_index.generated.js'
						: getObjectPathTo(pkg, ['module'])?.value;
					kind = 'module';
				}
			}
			check_export_field(session.logger, pkg, 'require', main);
			check_export_field(session.logger, pkg, 'import', module);
			if (typings) check_export_field(session.logger, pkg, 'types', typings);

			session.logger.terminal.writeDebugLine(`  - type = ${pkg.type}`);
			assert(pkg.type === kind, `"type" field must be "${kind}", got ${JSON.stringify(pkg.type)}`);

			requireFieldEquals(session.logger, pkg, ['exports', '.', 'main'], undefined);
			requireFieldEquals(session.logger, pkg, ['exports', '.', 'module'], undefined);
			requireFieldEquals(session.logger, pkg, ['exports', '.', 'typings'], undefined);

			requireFieldEquals(session.logger, pkg, ['main'], undefined);
			requireFieldEquals(session.logger, pkg, ['module'], undefined);
			requireFieldEquals(session.logger, pkg, ['types'], undefined);
			requireFieldEquals(session.logger, pkg, ['typings'], undefined);
		} catch (e: any) {
			CheckFail.th(`file content verify failed:\n    File: ${pkgPath}\n${e.message}\n`);
		}

		const npmignore = await mustLStat(resolve(configuration.buildFolderPath, '.npmignore'));
		assert(npmignore.isSymbolicLink(), `file must be symbolic link: .npmignore`);

		session.logger.terminal.writeLine('check complete!');
	}
	private async execute(session: IHeftTaskSession, configuration: HeftConfiguration) {
		try {
			await this.executeInner(session, configuration);
		} catch (e: any) {
			if (e instanceof CheckFail) {
				session.logger.emitError(new Error('project check failed: ' + e.message));
			} else {
				session.logger.terminal.writeErrorLine('plugin internal error!');
				session.logger.terminal.writeErrorLine(e.stack.replace(/^/gm, '    '));
				session.logger.emitError(e);
			}
		}
	}

	apply(session: IHeftTaskSession, configuration: HeftConfiguration, _options?: void): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, () => this.execute(session, configuration));
	}
}

class CheckFail extends Error {
	static th(message: string): never {
		const e = new CheckFail(message);
		e.stack = e.message;
		throw e;
	}
}

async function mustLStat(file: string) {
	try {
		const ss = await lstat(file);
		return ss;
	} catch (e) {
		throw new CheckFail(
			`missing or unreadable required file:\n    File: ${file}\n  Create it by running "ln -s ./node_modules/@build-script/single-dog-asset/package/npmignore .npmignore"`,
		);
	}
}

function assert(cond: boolean, message: string) {
	if (!cond) CheckFail.th(message);
}

async function loadCommentTemplate(path: string) {
	const json = parse(await readFile(path, 'utf-8')) as any;

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
				return parse('{\n' + comment.value.trim() + '\n}', undefined, true) as Record<string, any>;
			} catch (e: any) {
				throw new Error(`template file "${path}" has ${e.message}`);
			}
		}
	}
	throw new Error(`template file "${path}" has no json block comment`);
}

async function mustReadJson(file: string): Promise<any> {
	const data = await readFile(file, 'utf-8');
	try {
		return parse(data, undefined, true);
	} catch (e: any) {
		throw new Error(`failed parse json: ${e.message}`);
	}
}

function checkJsonConfig(data: any, template: Record<string, any>, exValue: string) {
	if (data.extends !== exValue) throw new Error(`"extends" must be "${exValue}"`);

	const cop = data.compilerOptions;
	if (!cop) CheckFail.th('missing compilerOptions');

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
	exportType: 'require' | 'import' | 'types',
	want: string | undefined,
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
