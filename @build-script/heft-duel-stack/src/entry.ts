import { loadPlugin } from '@build-script/heft-plugin-entry';
import { resolve } from 'path';

module.exports = loadPlugin({
	projectRoot: resolve(__dirname, '..'),
	distEntry: 'lib/plugin.js',
	sourceEntry: 'src/plugin.ts',
});
