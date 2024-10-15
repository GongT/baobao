import { findUpUntilSync, type IOutputShim } from '@build-script/heft-plugin-base';
import type { BuildContext, BuildOptions, BuildResult, Plugin } from 'esbuild';
import { context } from 'esbuild';
import { randomBytes } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import type { BaseExecuter } from './executer.base.js';
import { ImportExecuter } from './executer.import.js';
import { ThreadExecuter } from './executer.thread.js';
import type { FileBuilder } from './file-builder.js';
import { ExecuteReason } from './shared.js';

type IOptions = BuildOptions & { write: false; metafile: true };

const isAbsolute = /^[^.]/;
const isAllowedType = /\.[mc]?js$/;

const externalResovler: Plugin = {
	name: 'external-resolver',
	setup(build) {
		build.onResolve({ filter: isAbsolute, namespace: 'file' }, async (args) => {
			try {
				const result = await build.resolve(args.path, args);
				if (result.path && isAllowedType.test(result.path)) {
					return { external: true, pluginName: 'external-resolver' };
				}
			} catch {}
			return;
		});
	},
};

export interface GeneratorBody {
	generate(builder: FileBuilder, logger: IOutputShim): Promise<string | undefined>;
	dispose?(logger: IOutputShim): Promise<any>;
}

export class CodeGenerator {
	private context?: BuildContext<IOptions>;
	private compileResult?: BuildResult<IOptions>;
	private readonly packageFile;
	private readonly executer: BaseExecuter;
	private readonly filesToClean = new Set<string>();

	private readonly createTempFilePath: (hash?: string, ext?: string) => string;

	constructor(
		private readonly buildFoder: string, // path to nearest package.json folder
		private readonly entryFileAbs: string, // absolute path of *.generator.ts
		standalone: boolean, // true if run by binary, false if by heft
		public readonly logger: IOutputShim,
	) {
		const packageFile = findUpUntilSync(buildFoder, 'package.json');
		if (!packageFile) {
			throw new Error('failed find package.json from ' + buildFoder);
		}
		this.packageFile = packageFile;

		const dir = dirname(this.entryFileAbs);
		const base = basename(this.entryFileAbs, '.ts');

		this.createTempFilePath = (hash = randomBytes(6).toString('hex'), ext = 'mjs') => {
			return dir + '/.' + base + '.' + hash + '.' + ext;
		};

		const resultFile = entryFileAbs.replace(/\.generator\.ts$/, '.generated.ts');
		this.executer = new (standalone ? ImportExecuter : ThreadExecuter)(
			buildFoder,
			entryFileAbs,
			resultFile,
			this.logger,
		);
	}

	private async createContext(force = false) {
		if (!this.context || force) {
			this.dispose();
			this.logger.debug('create context');
			this.context = await context<IOptions>({
				write: false,
				metafile: true,
				bundle: true,
				sourcemap: 'linked',
				sourceRoot: '@@@@@/',
				entryPoints: [this.entryFileAbs],
				external: [],
				absWorkingDir: this.buildFoder,
				format: 'esm',
				platform: 'node',
				mainFields: ['typescript', 'module', 'main'],
				conditions: ['typescript'],
				outfile: this.createTempFilePath(), // not really write
				define: {
					__filename: 'import.meta.filename',
					__dirname: 'import.meta.dirname',
				},
				plugins: [
					externalResovler,
					{
						name: 'file-handler',
						setup: async (build) => {
							build.onEnd((result: BuildResult<IOptions>) => {
								if (!result.metafile) {
									return; // something has failed
								}
								for (const file of Object.keys(result.metafile.outputs)) {
									this.filesToClean.add(file);
								}
							});
						},
					},
				],
				tsconfigRaw: {
					compilerOptions: {},
				},
			});
		}
		return this.context;
	}

	shouldExecute(trigger: ReadonlySet<string>) {
		if (!this.compileResult) {
			this.logger.verbose("should run because compileResult doesn't exist");
			return ExecuteReason.NeedCompile;
		}

		for (const rel of Object.keys(this.compileResult.metafile.inputs)) {
			const abs = resolve(this.buildFoder, rel);
			if (trigger.has(abs)) {
				this.logger.verbose(`should run because source code has changed: ${abs}`);
				return ExecuteReason.NeedCompile;
			}
		}

		return this.executer.shouldExecute(trigger);
	}

	async compileRun(reason: ExecuteReason) {
		if (reason === ExecuteReason.NeedCompile || !this.compileResult) {
			delete this.compileResult;
			try {
				const context = await this.createContext();
				this.compileResult = await context.rebuild();
			} catch (e) {
				this.logger.error(`failed compile generater script: ${this.entryFileAbs}`);
				throw e;
			}

			const hasError = printEsbuildErrors(this.logger, this.compileResult);
			if (hasError) {
				delete this.compileResult;
				throw new Error('failed compile generater script: has compile error.');
			}
		}

		const outputs = this.compileResult.outputFiles;

		const scriptFile = this.createTempFilePath(outputs[0].hash);

		const src = outputs.find((e) => !e.path.endsWith('.map'));

		const mapFile = scriptFile + '.map';
		const map = outputs.find((e) => e.path.endsWith('.map'));

		if (!map || !src || outputs.length !== 2) {
			this.logger.warn(
				'compiled outputs:\n' +
					Object.values(outputs)
						.map((e) => `  - ${e.path}`)
						.join('\n'),
			);
			throw new Error('compile output invalid (must be map and src)');
		}

		//# sourceMappingURL=.concatType.generator.94937e1648fa.mjs.map
		let script = src.text.replace(/^\/\/#\s*sourceMappingURL=.*$/gm, '');
		script += '\n//# sourceMappingURL=./' + basename(mapFile);

		await writeFile(scriptFile, script, 'utf8');
		await writeFile(mapFile, map.text.replace('@@@@@', dirname(scriptFile)), 'utf8');
		this.logger.verbose('scriptFile: ' + scriptFile);

		try {
			return await this.executer.execute(scriptFile);
		} finally {
			this.logger.verbose('delete temp compile output.');
			unlink(scriptFile);
			unlink(mapFile);
		}
	}

	get relatedFiles() {
		const files = [];
		if (this.compileResult) {
			for (const rel of Object.keys(this.compileResult.metafile.inputs)) {
				files.push(resolve(this.buildFoder, rel));
			}
		} else {
			files.push(this.entryFileAbs);
		}
		return [...files, this.packageFile];
	}

	async dispose() {
		if (this.context) {
			this.logger.verbose('dispose context');
			const ctx = this.context;
			delete this.context;
			await ctx.dispose();
		}
	}
}

function printEsbuildErrors(logger: IOutputShim, result: BuildResult) {
	if (result.errors.length === 0 && result.warnings.length === 0) {
		logger.debug(`generator script compiled success`);
		return false;
	}

	const entry = Object.values(result.metafile!.outputs).find((e) => e.entryPoint)?.entryPoint;
	logger.error(`esbuild compile with errors (while bundle ${entry}):`);
	for (const { text, location } of result.errors) {
		logger.error(`✘ [ERROR] ${text}`);
		if (location) {
			logger.error(`    ${location.file}:${location.line}:${location.column}:`);
		}
	}
	for (const { text, location } of result.warnings) {
		logger.error(`✘ [WARN] ${text}`);
		if (location) {
			logger.error(`    ${location.file}:${location.line}:${location.column}:`);
		}
	}
	return true;
}
