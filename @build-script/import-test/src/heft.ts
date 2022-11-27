import { run } from './run';
import type { HeftConfiguration, HeftSession } from '@rushstack/heft';

const PLUGIN_NAME = 'node-import-test';

export function apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void {
	heftSession.hooks.build.tap(PLUGIN_NAME, (test) => {
		test.hooks.postBuild.tap(PLUGIN_NAME, (runStage) => {
			runStage.hooks.run.tap(PLUGIN_NAME, function test() {
				run(heftConfiguration.buildFolder);
			});
		});
	});
}

export const pluginName = '@build-script/' + PLUGIN_NAME;
