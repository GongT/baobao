const { resolve } = require('node:path');
const { readFileSync, writeFileSync } = require('node:fs');

function action(file) {
	const data = readFileSync(file, 'utf-8');

	lines = data.split('\n').filter((l) => {
		return !l.includes('@idlebox/itypes');
	});

	const result = `${lines.join('\n').trim()}\n`;

	if (result !== data) {
		writeFileSync(file, result);
		return true;
	}
	return false;
}

const PLUGIN_NAME = 'filter-dts';

module.exports = class CopyDtsIndexPlugin {
	apply(session, configuration) {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			console.error('todo');
			const root = resolve(configuration.buildFolderPath, 'lib');

			const ch1 = action(resolve(root, 'esm/__create_index.generated.d.mts'));
			if (ch1) session.logger.terminal.writeLine('.d.mts filtered.');

			const ch2 = action(resolve(root, 'cjs/__create_index.generated.d.cts'));
			if (ch2) session.logger.terminal.writeLine('.d.mts filtered.');
		});
	}
};
