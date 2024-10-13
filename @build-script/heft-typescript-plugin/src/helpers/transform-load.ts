import type { HeftConfiguration, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { isAbsolute, resolve } from 'path';
import type TypeScriptApi from 'typescript';
import { ITypescriptPluginDefine, isModuleResolutionError, type IHeftJsonOptions } from './type';

export interface IMyTransformTool extends IStaticTool {
	readonly program: TypeScriptApi.Program;
	readonly compilerHost: TypeScriptApi.CompilerHost;
	readonly options: ITypescriptPluginDefine['options'];
}

interface IStaticTool {
	readonly ts: typeof TypeScriptApi;
	readonly logger: IScopedLogger;
	readonly extension: string;
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
		compilerHost: TypeScriptApi.CompilerHost,
	): void;
}

const selfPlugin = process.env.IS_REALTIME_BUILD
	? resolve(__dirname, '../loader/main.js')
	: resolve(__dirname, '../transform/main.js');

/** @fixme 文件不存在时似乎不能正确报告错误 */
export class TsPluginSystem {
	private readonly extension: string;
	private readonly loaded = new Map<string, IPluginApply>();

	constructor(
		private readonly ts: typeof TypeScriptApi,
		private readonly session: IHeftTaskSession,
		private readonly configuration: HeftConfiguration,
		options: IHeftJsonOptions,
	) {
		this.extension = options.extension;
	}

	async loadAll(copts: TypeScriptApi.CompilerOptions) {
		const used = new Set<string>();
		const transforms = [{ transform: selfPlugin }];
		if (Array.isArray(copts.plugins)) {
			transforms.unshift(...(copts.plugins as any));
		}
		for (const def of transforms) {
			if (this.loaded.has(def.transform)) continue;
			if (used.has(def.transform)) throw new Error(`plugin "${def.transform}" is duplicated`);

			used.add(def.transform);

			const plugin = await this.loadPlugin(def);
			if (plugin) {
				this.loaded.set(def.transform, plugin);
			}
		}

		for (const item of this.loaded.keys()) {
			if (!used.has(item)) this.loaded.delete(item);
		}
	}

	private async loadPlugin(item: ITypescriptPluginDefine) {
		if (!item || !item.transform) {
			this.session.logger.terminal.writeDebugLine(`plugin value not reconized: ${JSON.stringify(item)}`);
			return;
		}

		let pkg, packagePath;
		try {
			packagePath = isAbsolute(item.transform)
				? item.transform
				: await this.configuration.rigPackageResolver.resolvePackageAsync(
						item.transform,
						this.session.logger.terminal,
					);

			if (!packagePath) throw new Error(`not found: ${item.transform}`);

			pkg = interop(await import(packagePath));
		} catch (e: any) {
			if (e instanceof Error) {
				this.session.logger.terminal.writeVerboseLine(e.message);
				if (e.message.includes('Unable to resolve') || isModuleResolutionError(e)) {
					this.session.logger.emitError(new Error(`can not find transformer: ${item.transform}`));
				}
			}

			throw e;
		}

		const callback: IMyTransformCallback<any> = requireExport(packagePath, pkg, item.importName);

		const creator = <T extends TypeScriptApi.Node>(
			program: TypeScriptApi.Program,
			host: TypeScriptApi.CompilerHost,
			context: TypeScriptApi.TransformationContext,
		): TypeScriptApi.Transformer<T> => {
			const transformer = callback(context, {
				program,
				options: item.options,
				ts: this.ts,
				logger: this.session.logger,
				compilerHost: host,
				extension: this.extension,
			});
			if (typeof transformer !== 'function') throw new Error(`transformer "${item.transform}" is not a function`);
			return transformer;
		};

		let plugin: IPluginApply;
		if (item.after) {
			plugin = (transformers, program, host) => {
				if (!transformers.after) transformers.after = [];
				transformers.after.push((context: TypeScriptApi.TransformationContext) => {
					return creator(program, host, context);
				});
				this.session.logger.terminal.writeVerboseLine(`register after transformer: ${item.transform}`);
			};
		} else if (item.afterDeclarations) {
			plugin = (transformers, program, host) => {
				if (!transformers.afterDeclarations) transformers.afterDeclarations = [];
				transformers.afterDeclarations.push((context: TypeScriptApi.TransformationContext) => {
					return creator(program, host, context);
				});
				this.session.logger.terminal.writeVerboseLine(`register dts transformer: ${item.transform}`);
			};
		} else {
			plugin = (transformers, program, host) => {
				if (!transformers.before) transformers.before = [];
				transformers.before.push((context: TypeScriptApi.TransformationContext) => {
					return creator(program, host, context);
				});
				this.session.logger.terminal.writeVerboseLine(`register before transformer: ${item.transform}`);
			};
		}

		return plugin;
	}

	create(program: TypeScriptApi.Program, host: TypeScriptApi.CompilerHost) {
		const transformers: TypeScriptApi.CustomTransformers = {};
		for (const create of this.loaded.values()) {
			create(transformers, program, host);
		}
		return transformers;
	}
}
function dumpExport(pkg: any) {
	const m: Record<string, string> = {};
	for (const [name, value] of Object.entries(pkg)) {
		m[name] = typeof value;
	}
	return JSON.stringify(m);
}
function requireExport(packagePath: string, pkg: any, importName: string | undefined): IMyTransformCallback<any> {
	if (importName) {
		if (typeof pkg?.default?.[importName] === 'function') {
			return pkg.default;
		} else if (typeof pkg?.[importName] === 'function') {
			return pkg.default;
		}
	} else {
		if (typeof pkg?.default === 'function') {
			return pkg.default;
		} else if (typeof pkg === 'function') {
			return pkg;
		}
	}
	let msg = `transform plugin package does not export "${importName || 'default'}" function
  package file: ${packagePath}
  exports: ${dumpExport(pkg)}`;
	if (pkg?.default) {
		msg += '\n  exports.default: ' + dumpExport(pkg.default);
	}
	throw new Error(msg);
}
function interop(exports: any) {
	return exports.default ?? exports;
}
