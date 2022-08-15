import { execa } from 'execa';
import { findRushRootPath } from '../api/load';

export async function spawnRushPassthrough(action: string, argv: string[], env: Record<string, string> = {}) {
	const rushRoot = await findRushRootPath();
	if (!rushRoot) {
		throw new Error('not in rush project');
	}

	const args = [action, ...argv];

	console.error('\x1B[38;5;14m + rush %s\x1B[0m', args.join(' '));

	return execa('rush', args, {
		stdio: 'inherit',
		cwd: rushRoot,
		env,
	});
}
