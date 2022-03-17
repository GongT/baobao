import { PROJECT_ROOT } from '../include/paths.js';
import { resolve, dirname } from 'path';
import { execaNode } from 'execa';
import { mkdirSync, rmSync, symlinkSync, existsSync } from 'fs';

const __dirname = dirname(import.meta.url).replace(/^file:\/\//, '');

describe('The module', () => {
	const tmp_node_modules = resolve(__dirname, 'node_modules');

	before('create test environment', () => {
		if (existsSync(tmp_node_modules)) {
			rmSync(tmp_node_modules, { force: true, recursive: true });
		}
		mkdirSync(resolve(tmp_node_modules, '@idlebox'), { recursive: true });
		symlinkSync(PROJECT_ROOT, resolve(tmp_node_modules, '@idlebox/node'));
	});
	after('delete test environment', () => {
		if (existsSync(tmp_node_modules)) {
			rmSync(tmp_node_modules, { force: true, recursive: true });
		}
	});

	it('should able to require', async () => {
		const r = await execaNode('require.cjs', { cwd: __dirname, stdio: 'inherit' });
		if (r.exitCode !== 0) {
			throw new Error('failed with code ' + r.exitCode);
		}
	});

	it('should able to import', async () => {
		const r = await execaNode('module.js', { cwd: __dirname, stdio: 'inherit' });
		if (r.exitCode !== 0) {
			throw new Error('failed with code ' + r.exitCode);
		}
	});
});
