import { readFile } from 'fs/promises';
import { normalizePath } from '@idlebox/common';
import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import { IHeftTaskPlugin } from '@rushstack/heft';
import commentJson from 'comment-json';
import type { BuildContext, BuildOptions } from 'esbuild';
import { filterOptions } from './common/config';
import { ESBuildPublicApi } from './common/type';

export const PLUGIN_NAME = 'esbuild';

export default class ESBuildPlugin implements IHeftTaskPlugin {
	private declare rootDir: string;

	static readonly PLUGIN_NAME = PLUGIN_NAME;
	readonly PLUGIN_NAME = PLUGIN_NAME;

	apply(session: IHeftTaskSession, configuration: HeftConfiguration): void {
		this.rootDir = normalizePath(configuration.buildFolderPath);

		const contextsPromise = this.getContext(session, configuration);

		session.hooks.run.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await contextsPromise;

			for (const context of contexts) {
				await context.rebuild();
			}

			session.logger.terminal.writeLine('complete build without errors.');

			await Promise.all(contexts.map((e) => e.dispose()));
		});

		session.hooks.runIncremental.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await contextsPromise;

			for (const context of contexts) {
				await context.rebuild();
			}

			session.logger.terminal.writeLine('complete build without errors.');
		});
	}

	private _tsnodeinited = false;
	private async _initOptions(session: IHeftTaskSession, configuration: HeftConfiguration) {
		let configFile;
		for (const ext of ['.ts', '.cjs', '.mjs', '.json']) {
			configFile = configuration.rigConfig.tryResolveConfigFilePath('config/esbuild' + ext);
			if (configFile) break;
		}
		if (!configFile) {
			throw new Error(
				'missing config file: config/esbuild.{ts|cjs|mjs|json}, it must `export const options: import("esbuild").BuildOptions` (or it\'s array)'
			);
		}

		session.logger.terminal.writeDebugLine('(re-)load config file: ' + configFile);
		let options_in: BuildOptions | BuildOptions[];
		if (configFile.endsWith('.ts')) {
			if (!this._tsnodeinited) {
				session.logger.terminal.writeDebug('loading ts-node: ');
				const tsnodePath = await configuration.rigPackageResolver.resolvePackageAsync(
					'ts-node',
					session.logger.terminal
				);
				session.logger.terminal.writeDebugLine(tsnodePath);
				require(tsnodePath + '/register');
				this._tsnodeinited = true;
			}

			options_in = require(configFile).options;
		} else if (configFile.endsWith('.cjs')) {
			const req = require(configFile);
			options_in = req.default?.options ?? req.options;
		} else if (configFile.endsWith('.mjs')) {
			const req = await import(configFile);
			options_in = req.options;
		} else if (configFile.endsWith('.json')) {
			const text = await readFile(configFile, 'utf-8');
			options_in = commentJson.parse(text, undefined, true) as any;
		} else {
			throw new Error('this is impossible');
		}
		if (typeof options_in !== 'object') throw new Error('invalid config file: ' + configFile);

		const optionsArray = Array.isArray(options_in) ? options_in : [options_in];

		session.logger.terminal.writeVerbose(JSON.stringify(optionsArray, null, 4));
		return optionsArray.map((options) => filterOptions(this.rootDir, options));
	}

	private declare _esbuild;
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

	private _contexts?: BuildContext[];
	async getContext(session: IHeftTaskSession, configuration: HeftConfiguration, force = false) {
		if (this._contexts && !force) return this._contexts;

		const esbuild = await this.getEsbuild(session, configuration);
		const optionsArray = await this._initOptions(session, configuration);

		const contexts = [];
		for (const options of optionsArray) {
			contexts.push(await esbuild.context<BuildOptions>(options));
		}

		this._contexts = contexts;
		return contexts;
	}
}
