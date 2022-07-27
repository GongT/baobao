import type TSPublic from 'typescript';
import type TTS from 'ttypescript/lib/PluginCreator';
import { createRequire } from 'module';
import { md5 } from '@idlebox/node';
import { loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { IScopedLogger } from '@rushstack/heft';

type TS = typeof TSPublic & typeof TSPrivate;

const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');

const patched = Symbol('ts-patched');

interface IRequire {
	(id: string): any;
	resolve(name: string): string;
}

function getTTS(rigRequire: IRequire): string {
	try {
		return rigRequire.resolve('ttypescript/lib/PluginCreator');
	} catch (e) {
		if (!isModuleResolutionError(e)) {
			throw e;
		}

		return require.resolve('ttypescript/lib/PluginCreator');
	}
}

export function patch(typescriptTool: string, require: IRequire, verbose: boolean, logger: IScopedLogger) {
	const typescript: TS = require(typescriptTool);

	if ((typescript as any)[patched]) {
		return;
	}

	(typescript as any)[patched] = true;

	const ttsPath = getTTS(require);
	const tts: typeof TTS = require(ttsPath);
	const resolve: typeof import('resolve') = createRequire(ttsPath)('resolve');
	const cache = new Map<string, Required<TSPublic.CustomTransformers>>();
	const resolveOrig = resolve.sync;

	/**
	 * @see https://github.com/cevek/ttypescript/blob/master/packages/ttypescript/src/PluginCreator.ts
	 */
	// @ts-ignore
	class PluginCreator extends tts.PluginCreator {
		constructor(configs: TTS.PluginConfig[]) {
			super(typescript, configs, '');

			for (const item of configs as any[]) {
				if (!item.hasOwnProperty('logger')) {
					item.logger = logger;
				}
				if (!item.hasOwnProperty('verbose')) {
					item.verbose = verbose;
				}
			}
		}

		resolveFactory(transform: string, importKey: string = 'default'): TTS.PluginFactory | undefined {
			logger.terminal.writeVerboseLine('loading TypeScript transform plugin: ', transform);
			resolve.sync = require.resolve;
			try {
				// @ts-ignore
				const ret = super.resolveFactory(transform, importKey);
				logger.terminal.writeVerboseLine('  transform resolve success!');
				return ret;
			} catch (e: any) {
				logger.terminal.writeErrorLine(
					'failed resolve TypeScript transform plugin "',
					transform,
					'": ',
					e.stack
				);
				throw e;
			} finally {
				resolve.sync = resolveOrig;
			}
		}
	}

	const original = typescript.getTransformers;
	typescript.getTransformers = function (
		compilerOptions: TSPublic.CompilerOptions,
		customTransformers?: TSPublic.CustomTransformers,
		emitOnlyDtsFiles?: boolean
	) {
		console.assert(
			compilerOptions.configFilePath,
			'TypeScript Api change, report issue to @build-script/heft-duel-stack'
		);

		const hash = md5(Buffer.from(JSON.stringify(compilerOptions)));
		let mergedTransformers = cache.get(hash);
		if (!mergedTransformers) {
			const command = loadTsConfigJsonFile(compilerOptions.configFilePath as any);
			const program = typescript.createProgram({ options: compilerOptions, rootNames: command.fileNames });
			program.emit = function voidEmit() {
				throw new Error('this program is fake, does not support emit.');
			};
			const pluginCreator = new PluginCreator(compilerOptions.plugins as any);
			mergedTransformers = pluginCreator.createTransformers({ program }, customTransformers);
			logger.terminal.writeVerboseLine('creating new pluginCreator!');
			cache.set(hash, mergedTransformers);
		}

		return original(compilerOptions, mergedTransformers, emitOnlyDtsFiles);
	};
}

declare namespace TSPrivate {
	export function getTransformers(
		compilerOptions: TSPublic.CompilerOptions,
		customTransformers?: TSPublic.CustomTransformers,
		emitOnlyDtsFiles?: boolean
	): any;
}
