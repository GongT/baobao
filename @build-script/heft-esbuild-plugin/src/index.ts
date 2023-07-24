import { normalizePath } from '@idlebox/common';
import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import { IHeftTaskPlugin } from '@rushstack/heft';
import { FileError } from '@rushstack/node-core-library';
import type { BuildContext, BuildOptions, BuildResult, Message, Note } from 'esbuild';
import { FilterdBuildOptions, filterOptions } from './common/config';
import { executeConfigFile } from './common/execute-config';
import { s } from './common/misc';
import { ESBuildPublicApi, IGlobalSession } from './common/type';
import { createEmitter, IProjectEmitter } from './common/write';

export const PLUGIN_NAME = 'esbuild';

function emitResultErrors(result: BuildResult, session: IHeftTaskSession, rootDir: string) {
	const createError = (item: Message | Note) => {
		let e: Error;
		let msg: string;
		if ('id' in item) {
			msg = `${item.pluginName} [${item.id}] ${item.text}`;
		} else {
			msg = '[Note] ' + item.text;
		}
		if (item.location) {
			e = new FileError(msg, {
				projectFolder: rootDir,
				absolutePath: item.location.file,
				line: item.location.line,
				column: item.location.column + 1,
			});
		} else {
			e = new Error(msg);
		}
		e.stack = e.message;
		return e;
	};
	for (const error of result.errors) {
		session.logger.emitError(createError(error));
		for (const note of error.notes) {
			session.logger.emitWarning(createError(note));
		}
	}
	for (const warn of result.warnings) {
		session.logger.emitWarning(createError(warn));
		for (const note of warn.notes) {
			session.logger.emitWarning(createError(note));
		}
	}
}

export default class ESBuildPlugin implements IHeftTaskPlugin {
	private declare rootDir: string;

	static readonly PLUGIN_NAME = PLUGIN_NAME;
	readonly PLUGIN_NAME = PLUGIN_NAME;

	apply(session: IHeftTaskSession, configuration: HeftConfiguration, userInput: any): void {
		this.rootDir = normalizePath(configuration.buildFolderPath);

		session.hooks.run.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await this.getContext(session, configuration, userInput ?? {});

			let writtenFiles = 0;
			const allMeta = await Promise.all(
				contexts.map(async ({ context, options, emitter }) => {
					const result = await context.rebuild();
					emitResultErrors(result, session, this.rootDir);
					const ret = await emitter({
						metafile: result.metafile,
						outputFiles: result.outputFiles,
						options,
						session,
					});

					writtenFiles += ret.writtenFiles;

					return result.metafile;
				})
			);

			allMeta.forEach((e) => {
				session.logger.terminal.writeLine(this._esbuild.analyzeMetafileSync(e));
			});

			showTip(contexts, writtenFiles);

			await Promise.all(contexts.map(({ context }) => context.dispose()));
		});

		session.hooks.runIncremental.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await this.getContext(session, configuration, userInput ?? {});

			let writtenFiles = 0;
			const allMeta = await Promise.all(
				contexts.map(async ({ context, options, emitter }) => {
					const result = await context.rebuild();
					emitResultErrors(result, session, this.rootDir);
					const ret = await emitter({
						metafile: result.metafile,
						outputFiles: result.outputFiles,
						options,
						session,
					});

					writtenFiles += ret.writtenFiles;

					return result.metafile;
				})
			);

			allMeta.forEach((e) => {
				session.logger.terminal.writeVerboseLine(this._esbuild.analyzeMetafileSync(e));
			});

			showTip(contexts, writtenFiles);
		});

		function showTip(contexts: IContext[], writtenFiles: number) {
			const t1 = s(contexts.length, 'project');
			const t2 = s(writtenFiles, 'file');
			session.logger.terminal.writeLine(`complete build ${t1}, ${t2}.`);
		}
	}

	private async _initOptions(
		esbuild: ESBuildPublicApi,
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		userInput: any
	) {
		let configFile;
		for (const ext of ['.cts', '.mts', '.ts', '.cjs', '.mjs', '.json']) {
			configFile = configuration.rigConfig.tryResolveConfigFilePath('config/esbuild' + ext);
			if (configFile) break;
		}
		if (!configFile) {
			throw new Error(
				'missing config file: config/esbuild.{ts|cjs|mjs|json}, it must `export const options: import("esbuild").BuildOptions` (or it\'s array)'
			);
		}

		const configSession: IGlobalSession = {
			esbuild,
			logger: session.logger,
			taskName: session.taskName,
			rootDir: this.rootDir,
			options: userInput,
			tempFolderPath: session.tempFolderPath,
			resolve(packageName: string) {
				return configuration.rigPackageResolver.resolvePackageAsync(packageName, session.logger.terminal);
			},
			rigConfig: configuration.rigConfig,
			watchFiles(_files: string[]) {
				//TODO
			},
		};
		Object.assign(globalThis, { session: configSession });
		const { onEmit, options } = await executeConfigFile(configFile, session, configuration);
		Object.assign(globalThis, { session: undefined });

		session.logger.terminal.writeVerboseLine(JSON.stringify(options, null, 4));
		return {
			optionsArray: options.map((e) => filterOptions(this.rootDir, e)),
			onEmit,
		};
	}

	private declare _esbuild: ESBuildPublicApi;
	private async getEsbuild(session: IHeftTaskSession, configuration: HeftConfiguration): Promise<ESBuildPublicApi> {
		if (!this._esbuild) {
			session.logger.terminal.writeDebug('loading esbuild: ');
			const esbuildPath = await configuration.rigPackageResolver.resolvePackageAsync(
				'esbuild',
				session.logger.terminal
			);
			session.logger.terminal.writeDebugLine(esbuildPath);
			this._esbuild = require(esbuildPath);
		}
		return this._esbuild;
	}

	private _contexts?: Promise<IContext[]>;
	getContext(session: IHeftTaskSession, configuration: HeftConfiguration, userInput: object) {
		if (!this._contexts) {
			this._contexts = this._getContext(session, configuration, userInput);
		}
		return this._contexts;
	}

	async _getContext(session: IHeftTaskSession, configuration: HeftConfiguration, userInput: object) {
		const esbuild = await this.getEsbuild(session, configuration);
		const { optionsArray, onEmit } = await this._initOptions(esbuild, session, configuration, userInput);

		const contexts: IContext[] = [];
		for (const options of optionsArray) {
			contexts.push({
				context: await esbuild.context<BuildOptions>(options),
				options,
				emitter: createEmitter(onEmit),
			});
		}

		return contexts;
	}
}

interface IContext {
	readonly context: BuildContext<FilterdBuildOptions>;
	readonly options: Readonly<FilterdBuildOptions>;
	readonly emitter: IProjectEmitter;
}
