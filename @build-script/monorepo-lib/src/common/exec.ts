import { execLazyError } from '@idlebox/node';

/**
 * @private
 */
export async function execJson(cmds: string[], cwd: string) {
	const p = await execLazyError(cmds[0], cmds.slice(1), { cwd });
	return JSON.parse(p.stdout);
}
