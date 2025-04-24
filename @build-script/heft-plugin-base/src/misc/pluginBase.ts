import type {
	HeftConfiguration,
	IHeftPlugin,
	IHeftTaskRunIncrementalHookOptions,
	IHeftTaskSession,
} from '@rushstack/heft';
import { ConfigurationFile, type IConfigurationFileOptionsBase } from '@rushstack/heft-config-file';
import { wrapHeftLogger, type IOutputShim } from './scopedLogger.js';

export class DontExecute extends Error {}

type PluginConstructor<T> = new (
	session: IHeftTaskSession,
	configuration: HeftConfiguration,
	pluginOptions: T
) => PluginInstance<T>;

export type TaskPlugin = IHeftPlugin<IHeftTaskSession>;

export function createTaskPlugin(name: string, Cls: PluginConstructor<any>): TaskPlugin {
	return class {
		constructor() {
			let plugin: PluginInstance<any>;
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return {
				pluginName: name,
				get accessor() {
					return plugin?.accessor;
				},
				apply(session: IHeftTaskSession, configuration: HeftConfiguration, pluginOptions?: any): void {
					try {
						plugin = new Cls(session, configuration, pluginOptions || {});
					} catch (e: unknown) {
						if (e instanceof DontExecute) {
							session.logger.terminal.writeDebugLine(`disabled: missing config file: ${e.message}`);
							return;
						}
						throw e;
					}

					Object.assign(plugin, {
						loadConfig() {
							throw new Error('too late to load config.');
						},
					});

					if (plugin.run || plugin.watch) {
						session.hooks.registerFileOperations.tapPromise(name, async (r) => {
							try {
								await plugin.init();
								return r;
							} catch (e: any) {
								session.logger.terminal.writeErrorLine(`plugin ${name} init error: ${e.stack}`);
								throw e;
							}
						});
					}
					if (plugin.run) {
						// session.logger.terminal.writeDebugLine(`tap run`);
						session.hooks.run.tapPromise(name, async () => {
							await plugin.run?.();
						});
					}
					if (plugin.watch) {
						// session.logger.terminal.writeDebugLine(`tap runIncremental`);
						let firstTime = true;
						session.hooks.runIncremental.tapPromise(name, async (opt) => {
							await plugin.watch?.(Object.assign(opt, { firstTime }));
							firstTime = false;
						});
					}
				},
			};
		}
	};
}

export interface IWatchOptions extends IHeftTaskRunIncrementalHookOptions {
	readonly firstTime: boolean;
}

export abstract class PluginInstance<OptionsT = object> {
	protected readonly logger: IOutputShim;
	constructor(
		protected readonly session: IHeftTaskSession,
		protected readonly configuration: HeftConfiguration,
		protected pluginOptions: OptionsT
	) {
		this.logger = wrapHeftLogger(this.session);
	}

	get accessor(): any {
		return {};
	}

	/**
	 * override this method to async initialize the plugin
	 */
	async init(): Promise<void> {
		return;
	}

	public abstract run?(): Promise<void>;
	public abstract watch?(watchOptions: IWatchOptions): Promise<void>;

	/**
	 * only callable inside subclass constructor
	 */
	protected loadConfig<T>(name: string, schema: string | object, required?: true): T;
	protected loadConfig<T>(name: string, schema: string | object, required: false): T | undefined;
	protected loadConfig<T>(name: string, schema: string | object, required = true) {
		const file = `config/${name}.json`;

		const opts = {
			projectRelativeFilePath: file,
		} satisfies IConfigurationFileOptionsBase<any>;
		const config = new ConfigurationFile<T>(
			typeof schema === 'string' ? { ...opts, jsonSchemaPath: schema } : { ...opts, jsonSchemaObject: schema }
		);

		if (required) {
			try {
				return config.loadConfigurationFileForProject(
					this.session.logger.terminal,
					this.configuration.buildFolderPath,
					this.configuration.rigConfig
				);
			} catch (e: any) {
				if (e?.code === 'ENOENT') {
					throw new DontExecute(file);
				}
				throw e;
			}
		} else {
			return config.tryLoadConfigurationFileForProject(
				this.session.logger.terminal,
				this.configuration.buildFolderPath,
				this.configuration.rigConfig
			);
		}
	}
}
