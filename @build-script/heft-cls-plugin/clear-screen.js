module.exports = class ClearScreenPlugin {
	apply(session, _heftConfiguration, _pluginOptions) {
		const isDebug = process.argv.includes('--debug');
		const isChain = !!process.env.npm_lifecycle_event;
		session.hooks.toolStart.tap('clear-screen', () => {
			if (!isDebug && !isChain && process.stderr.isTTY) {
				process.stdout.write('\x1Bc');
			}
		});
	}
};
