import type TypeScriptApi from 'typescript';
import type {
	HeftConfiguration,
	IHeftTaskPlugin,
	IHeftTaskRunIncrementalHookOptions,
	IHeftTaskSession,
} from '@rushstack/heft';
import { getTypeScript } from './getTypeScript';
import { ILoadConfigOverride, loadTsConfigJson } from './loadTsConfigJson';

export abstract class HeftPlugin<StateT, OptionsT = {}> implements IHeftTaskPlugin {
	protected declare readonly state: Readonly<StateT & { options: OptionsT }>;

	abstract readonly PLUGIN_NAME: string;

	apply(session: IHeftTaskSession, configuration: HeftConfiguration, pluginOptions: void | OptionsT): void {
		if (this.run) {
			// session.logger.terminal.writeDebugLine(`tap run`);
			session.hooks.run.tapPromise(this.PLUGIN_NAME, async () => {
				if (!this.state) {
					Object.assign(this, { state: { options: pluginOptions || {} } });
				}
				await this.loadState(this.state, session, configuration);

				await this.run!(session, configuration);
			});
		}
		if (this.runWatch) {
			// session.logger.terminal.writeDebugLine(`tap runIncremental`);
			session.hooks.runIncremental.tapPromise(this.PLUGIN_NAME, async (opt) => {
				if (!this.state) {
					Object.assign(this, { state: { options: pluginOptions || {} } });
				}
				await this.loadState(this.state, session, configuration);

				await this.runWatch!(session, configuration, opt);
			});
		}
	}

	run?(session: IHeftTaskSession, configuration: HeftConfiguration): Promise<void>;
	runWatch?(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		watchOptions: IHeftTaskRunIncrementalHookOptions
	): Promise<void>;

	protected abstract loadState(
		state: StateT & { options: OptionsT },
		session: IHeftTaskSession,
		configuration: HeftConfiguration
	): Promise<void>;
}

export interface ITypeScriptState {
	ts: typeof TypeScriptApi;
}

export abstract class HeftTypescriptPlugin<
	StateT extends ITypeScriptState,
	OptionsT extends ILoadConfigOverride
> extends HeftPlugin<StateT, OptionsT> {
	protected override async loadState(
		state: StateT & { options: OptionsT },
		session: IHeftTaskSession,
		configuration: HeftConfiguration
	) {
		if (!state.ts) state.ts = await getTypeScript(session, configuration);
		this.loadExtraState?.(state, session, configuration);
	}

	protected loadExtraState?(
		state: StateT & { options: OptionsT },
		session: IHeftTaskSession,
		configuration: HeftConfiguration
	): Promise<void>;

	protected loadConfig(session: IHeftTaskSession, configuration: HeftConfiguration) {
		return loadTsConfigJson(session.logger, this.state.ts, configuration.rigConfig, this.state.options as any);
	}

	protected async loadConfigWatch(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		{ watchGlobAsync }: IHeftTaskRunIncrementalHookOptions
	) {
		const { command, files: configFiles } = this.loadConfig(session, configuration);
		const watch = [...configFiles];

		if (command.raw?.include) {
			watch.push(...command.raw?.include);
		}
		if (command.raw?.files) {
			watch.push(...command.raw?.files);
		} else {
			const compilerOptions = command.options;
			watch.push('**/*.ts');
			watch.push('**/*.tsx');
			if (compilerOptions.resolveJsonModule) {
				watch.push('**/*.json');
			}
			if (compilerOptions.allowJs) {
				watch.push('**/*.js');
				watch.push('**/*.jsx');
			}
		}

		// console.log('watch (%s):', command.options.rootDir, watch);
		const map = await watchGlobAsync(watch, {
			cwd: command.options.rootDir,
			absolute: true,
			ignore: command.raw?.exclude,
		});
		// console.log('result:', map);

		const files = [];
		for (const [file, { changed }] of map.entries()) {
			if (!changed) continue;

			files.push(file);
		}

		return { files, command };
	}
}
