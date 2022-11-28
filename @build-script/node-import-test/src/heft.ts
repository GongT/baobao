import { run } from './run';
import type { HeftConfiguration, HeftSession } from '@rushstack/heft';

const PLUGIN_NAME = 'node-import-test';

export function apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void {
	heftSession.hooks.build.tap(PLUGIN_NAME, (test) => {
		test.hooks.postBuild.tap(PLUGIN_NAME, (runStage) => {
			runStage.hooks.run.tapPromise(PLUGIN_NAME, async function test() {
				const ret = run(heftConfiguration.buildFolder);
				if (ret) {
					return Promise.reject(new Error('[Import Test] ' + ret));
				}
			});
		});
	});
}

export const pluginName = '@build-script/' + PLUGIN_NAME;
