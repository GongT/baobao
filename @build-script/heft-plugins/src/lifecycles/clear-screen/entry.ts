import type { HeftConfiguration, IHeftLifecyclePlugin, IHeftLifecycleSession } from '@rushstack/heft';

Error.stackTraceLimit = Infinity;

export default class ClearScreenPlugin implements IHeftLifecyclePlugin {
	apply(
		session: IHeftLifecycleSession,
		_heftConfiguration: HeftConfiguration,
		_pluginOptions?: void | undefined,
	): void {
		session.hooks.toolStart.tap('clear-screen', () => {
			process.stdout.write('\x1Bc');
		});
	}
}
