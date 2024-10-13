Error.stackTraceLimit = Infinity;

let registed = false;
if (!process.argv.find((e) => e.startsWith('--inspect'))) {
	require('source-map-support/register');
	registed = true;
}

let noteOut = false;

module.exports = class SourcemapSupportPlugin {
	apply(session, _heftConfiguration, _pluginOptions) {
		session.hooks.toolStart.tap('source-map-support', () => {
			if (!noteOut) {
				noteOut = true;
				if (registed) {
					session.logger.terminal.writeLine('Source map support is enabled.');
				} else {
					session.logger.terminal.writeLine('Source map support is disabled.');
				}
			}
		});
	}
};
