import * as execa from 'execa';
import { resolve } from 'path';
import { checkChildProcessResult, commmandInPathSync } from '@idlebox/node';
import { existsSync } from 'fs-extra';
import { TEMP_DIR } from './paths';

export const doSpawn: (file: string, args?: string[]) => void =
	commmandInPathSync('unshare') && !process.env.NEVER_UNSHARE ? spawnUnshare : spawnNormal;

function getFile(file: string) {
	file = resolve(__dirname, '../actions/', file);
	if (!existsSync(file)) {
		throw new Error('Can not spawn file: ' + file);
	}
	return file;
}
function nodejsArguments(file: string, args: string[]) {
	return ['--unhandled-rejections=strict', '-r', require.resolve('source-map-support/register'), file, ...args];
}

function spawnNormal(file: string, args: string[] = []) {
	file = getFile(file);
	console.log('Using spawn without unshare.');
	normalExec(process.argv0, nodejsArguments(file, args));
}

function spawnUnshare(file: string, args: string[] = []) {
	file = getFile(file);

	console.log('Using unshare on unix.');
	const cmds = [
		'-m',
		'-C',
		'-p',
		'-f',
		'--kill-child',
		'--mount-proc',
		'--propagation',
		'private',
		`--wd=${TEMP_DIR}`,
	];

	cmds.push(process.argv0, ...nodejsArguments(file, args));

	normalExec('unshare', cmds);
}

function normalExec(cmd: string, argv: string[]) {
	console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
	const subProcess = execa(cmd, argv, {
		stdio: 'inherit',
		shell: false,
		cwd: TEMP_DIR,
		reject: false,
	});

	subProcess.then((result) => {
		checkChildProcessResult(result);
	});
}
