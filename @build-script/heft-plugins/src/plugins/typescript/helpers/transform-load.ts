import type TypeScriptApi from 'typescript';
import type { HeftConfiguration, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { isAbsolute, resolve } from 'path';
import { IMyPluginConfig, IProgramState, isModuleResolutionError } from './type';

export interface IMyTransformTool {
	ts: typeof TypeScriptApi;
	program: TypeScriptApi.Program;
	compilerHost: TypeScriptApi.CompilerHost;
	logger: IScopedLogger;
	extension: string;
	options: IMyPluginConfig['options'];
}

/** plugin file should export this: */
export interface IMyTransformCallback<T extends TypeScriptApi.Node> {
	(context: TypeScriptApi.TransformationContext, tools: IMyTransformTool): TypeScriptApi.Transformer<T>;
}

export interface IPluginInit {
	(program: TypeScriptApi.Program, compilerHost: TypeScriptApi.CompilerHost): TypeScriptApi.CustomTransformers;
}

interface IPluginApply {
	(
		transformers: TypeScriptApi.CustomTransformers,
		program: TypeScriptApi.Program,
		compilerHost: TypeScriptApi.CompilerHost
	): void;
}

interface IMyPluginLoaded {
	readonly name: string;
	readonly plugin: IPluginApply;
}

const selfPlugin = resolve(__dirname, '../transform/main.js');

export async function loadTransformers(
	session: IHeftTaskSession,
	configuration: HeftConfiguration,
	{ options, ts }: IProgramState
) {
	const plugins: IMyPluginConfig[] = [
		{
			transform: selfPlugin,
		},
	];
	if (options.compilerOptions?.plugins) plugins.push(...options.compilerOptions.plugins);
	const loaded: IMyPluginLoaded[] = [];

	for (const item of plugins) {
		let pkg, packagePath;
		try {
			packagePath = isAbsolute(item.transform)
				? item.transform
				: await configuration.rigPackageResolver.resolvePackageAsync(item.transform, session.logger.terminal);

			if (!packagePath) throw new Error(`not found: ${item.transform}`);

			pkg = require(packagePath);
		} catch (e: any) {
			if (e instanceof Error) {
				session.logger.terminal.writeVerboseLine(e.message);
				if (e.message.includes('Unable to resolve') || isModuleResolutionError(e)) {
					throw new Error(`can not find transformer: ${item.transform}`);
				}
			}

			throw e;
		}

		let callback: IMyTransformCallback<any>;
		if (item.importName) {
			callback = pkg[item.importName];
			if (!callback) throw new Error(`file "${packagePath}" does not export "${item.importName}"`);
			if (typeof pkg[item.importName] !== 'function')
				throw new Error(`file "${packagePath}" export "${item.importName}" not a function`);
		} else {
			if (typeof pkg?.default === 'function') callback = pkg.default;
			else if (typeof pkg === 'function') callback = pkg;
			else throw new Error(`file "${packagePath}" does not export a default function`);
		}

		function creator<T extends TypeScriptApi.Node>(
			program: TypeScriptApi.Program,
			host: TypeScriptApi.CompilerHost,
			context: TypeScriptApi.TransformationContext
		): TypeScriptApi.Transformer<T> {
			const transformer = callback(context, {
				program,
				options: item.options,
				ts: ts,
				logger: session.logger,
				compilerHost: host,
				extension: options.extension!,
			});
			if (typeof transformer !== 'function') throw new Error(`transformer "${item.transform}" is not a function`);
			return transformer;
		}

		let plugin: IPluginApply;
		if (item.after) {
			plugin = (transformers, program, host) => {
				if (!transformers.after) transformers.after = [];
				transformers.after.push((context: TypeScriptApi.TransformationContext) => {
					return creator(program, host, context);
				});
				session.logger.terminal.writeVerboseLine(`register after transformer: ${item.transform}`);
			};
		} else if (item.afterDeclarations) {
			plugin = (transformers, program, host) => {
				if (!transformers.afterDeclarations) transformers.afterDeclarations = [];
				transformers.afterDeclarations.push((context: TypeScriptApi.TransformationContext) => {
					return creator(program, host, context);
				});
				session.logger.terminal.writeVerboseLine(`register dts transformer: ${item.transform}`);
			};
		} else {
			plugin = (transformers, program, host) => {
				if (!transformers.before) transformers.before = [];
				transformers.before.push((context: TypeScriptApi.TransformationContext) => {
					return creator(program, host, context);
				});
				session.logger.terminal.writeVerboseLine(`register before transformer: ${item.transform}`);
			};
		}

		loaded.push({ name: item.transform, plugin });
	}

	const r: IPluginInit = (program, host) => {
		const transformers: TypeScriptApi.CustomTransformers = {};
		for (const item of loaded) {
			item.plugin(transformers, program, host);
		}
		return transformers;
	};

	return r;
}
