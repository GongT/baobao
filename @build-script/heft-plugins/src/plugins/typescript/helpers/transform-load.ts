import type TypeScriptApi from 'typescript';
import type { HeftConfiguration, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { isAbsolute, resolve } from 'path';
import { IMyOptions, IMyPluginConfig, isModuleResolutionError } from './type';

export interface IMyTransformTool {
	ts: typeof TypeScriptApi;
	program: TypeScriptApi.Program;
	compilerHost: TypeScriptApi.CompilerHost;
	logger: IScopedLogger;
	extension: string;
	options: IMyPluginConfig['options'];
}
export interface IMyTransformCallback<T extends TypeScriptApi.Node> {
	(context: TypeScriptApi.TransformationContext, tools: IMyTransformTool): TypeScriptApi.Transformer<T>;
}

export async function loadTransformers(
	host: TypeScriptApi.CompilerHost,
	program: TypeScriptApi.Program,
	session: IHeftTaskSession,
	configuration: HeftConfiguration,
	options: IMyOptions,
	ts: typeof TypeScriptApi
) {
	const customTransformers: TypeScriptApi.CustomTransformers = {};

	const plugins: IMyPluginConfig[] = [];
	plugins.push({
		transform: resolve(__dirname, '../transform/main.js'),
	});
	if (options.compilerOptions?.plugins) plugins.push(...options.compilerOptions?.plugins);

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
			context: TypeScriptApi.TransformationContext
		): TypeScriptApi.Transformer<T> {
			const transformer = callback(context, {
				program,
				options: item.options,
				ts,
				logger: session.logger,
				compilerHost: host,
				extension: options.extension!,
			});
			if (typeof transformer !== 'function') throw new Error(`transformer "${item.transform}" is not a function`);
			return transformer;
		}

		if (item.after) {
			if (!customTransformers.after) customTransformers.after = [];
			customTransformers.after.push(creator);
			session.logger.terminal.writeVerboseLine(`register after transformer: ${item.transform}`);
		} else if (item.afterDeclarations) {
			if (!customTransformers.afterDeclarations) customTransformers.afterDeclarations = [];
			customTransformers.afterDeclarations.push(creator);
			session.logger.terminal.writeVerboseLine(`register dts transformer: ${item.transform}`);
		} else {
			if (!customTransformers.before) customTransformers.before = [];
			customTransformers.before.push(creator);
			session.logger.terminal.writeVerboseLine(`register before transformer: ${item.transform}`);
		}
	}

	return customTransformers;
}
