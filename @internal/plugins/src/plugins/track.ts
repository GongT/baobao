import { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';

export const PLUGIN_NAME = 'track';

export default class TrackPlugin implements IHeftTaskPlugin {
	apply(session: IHeftTaskSession, _configuration: HeftConfiguration): void {
		session.hooks.run.tap(PLUGIN_NAME, () => {
			session.logger.terminal.writeVerboseLine('track build step.');
		});
	}
}
