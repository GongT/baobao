import { resolve } from 'path';
import { MyError } from './lib';
import { loadConfig } from './load-config';
import { runGenerate } from './run';

Promise.resolve()
	.then(() => {
		const locPos = process.argv.indexOf('-p');
		const loc = process.argv[locPos + 1];
		if (locPos === -1 || !loc) {
			throw new MyError('usage: $0 -p <location to tsconfig.json>');
		}

		return resolve(process.cwd(), loc);
	})
	.then(loadConfig)
	.then(runGenerate)
	.then(
		() => {
			console.log('[generate] all complete!');
			process.exit(0);
		},
		(e) => {
			if (e instanceof MyError) {
				console.error('[generate] failed: %s', e.message);
			} else {
				console.error(e.stack);
			}
			process.exit(1);
		}
	);
