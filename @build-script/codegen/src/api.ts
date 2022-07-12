import { loadConfig } from './load-config';
import { runGenerate } from './run';

import type { IBuildStageContext, IPostBuildSubstage, HeftConfiguration, HeftSession } from '@rushstack/heft';
import { register } from 'ts-node';

// export const optionsSchema = loadJsonFileSync(resolve(__dirname, '../assets/schema.json'));

interface IMyOptions {
	project: string;
}

const PLUGIN_NAME = 'codegen';

export function apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration, options?: IMyOptions): void {
	heftSession.hooks.build.tap(PLUGIN_NAME, (build: IBuildStageContext) => {
		build.hooks.preCompile.tap(PLUGIN_NAME, (preCompile: IPostBuildSubstage) => {
			preCompile.hooks.run.tapPromise(PLUGIN_NAME, async function codegen() {
				register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
				const cfg = await loadConfig(options?.project ?? heftConfiguration.buildFolder);
				await runGenerate(cfg);
			});
		});
	});
}

export const pluginName = '@build-script/codegen';
