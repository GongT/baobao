import type { HeftConfiguration, IHeftTaskRunIncrementalHookOptions, IHeftTaskSession } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';
import { HeftTypescriptPlugin } from '../../misc/pluginBase';
import { executeCompile } from './helpers/compiler';
import { loadTransformers } from './helpers/transform-load';
import { IMyOptionsInput, IProgramState } from './helpers/type';

export const PLUGIN_NAME = 'typescript';

export default class TypeScriptPlugin extends HeftTypescriptPlugin<IProgramState, IMyOptionsInput> {
	override PLUGIN_NAME: string = PLUGIN_NAME;

	override async run(session: IHeftTaskSession, configuration: HeftConfiguration) {
		executeCompile(this.state, session, configuration);
	}

	private first = true;
	override async runWatch(
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
		watchOptions: IHeftTaskRunIncrementalHookOptions,
	): Promise<void> {
		const { files } = await this.loadConfigWatch(session, configuration, watchOptions);

		// console.log('changed: ', files);
		if (this.first) {
			this.first = false;
			executeCompile(this.state, session, configuration);
		} else {
			executeCompile(this.state, session, configuration, files);
		}
	}

	override async loadExtraState(
		state: IProgramState & { options: IMyOptionsInput },
		session: IHeftTaskSession,
		configuration: HeftConfiguration,
	) {
		const compilerOptions = Object.assign({}, state.options.compilerOptions);
		if (state.options.fast) {
			Object.assign(compilerOptions, {
				skipDefaultLibCheck: true,
				skipLibCheck: true,
				incremental: false,
				composite: false,
				declaration: false,
				declarationMap: false,
				alwaysStrict: false,
				isolatedModules: true,
				tsBuildInfoFile: null as any,
				declarationDir: null as any,
			} as TypeScriptApi.CompilerOptions);
		}
		state.options.compilerOptions = compilerOptions;
		if (!state.createTransformers)
			state.createTransformers = await loadTransformers(session, configuration, this.state);
	}
}
