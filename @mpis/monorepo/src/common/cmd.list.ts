import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { createMonorepoObject } from './workspace.js';

export async function runList() {
	const depth = parseInt(argv.single(['--depth']) || '0');
	if (argv.unused().length) {
		logger.error`Unknown arguments: ${argv.unused().join(', ')}`;
		return shutdown(1);
	}

	const repo = await createMonorepoObject();
	repo._finalize();

	const text = repo.dump(depth);

	console.log(text);
}
