import { EXPORT_TEMP_PATH } from '../inc/argParse';
import { debug } from './debug';

const execa = require('execa');

export function run(command: string, args: string[]) {
	debug('Running %s %s', command, args.join(' '));
	const p = execa(command, args, {
		cwd: EXPORT_TEMP_PATH,
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	p.stdout!.pipe(process.stdout);
	p.stderr!.pipe(process.stderr);
	return p;
}
