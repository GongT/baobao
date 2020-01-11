import { EXPORT_TEMP_PATH } from '../inc/argParse';

const execa = require('execa');

export function run(command: string, args: string[]) {
	console.log('Running %s %s', command, args.join(' '));
	const p = execa(command, args, { cwd: EXPORT_TEMP_PATH });
	p.stdout!.pipe(process.stdout);
	p.stderr!.pipe(process.stderr);
	return p;
}
