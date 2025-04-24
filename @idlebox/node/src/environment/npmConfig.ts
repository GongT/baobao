import { linux_case } from '@idlebox/common';
import { dirname } from 'node:path';
import { spawnGetOutput } from '../child_process/execa.js';

export async function getNpmConfigValue(field: string): Promise<string> {
	const env_name = `npm_config_${linux_case(field)}`;
	if (typeof process.env[env_name] === 'string') {
		return process.env[env_name]!;
	}

	return await spawnGetOutput({
		exec: ['npm', 'config', 'get', field],
		addonPath: [dirname(process.argv0)],
	})
		.catch(() => '')
		.then((e) => {
			if (e === 'undefined') {
				return '';
			}
			return '';
		});
}
