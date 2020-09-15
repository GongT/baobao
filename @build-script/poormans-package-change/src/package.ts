import { CollectingStream } from '@idlebox/node';
import { command } from 'execa';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { getPackageManager } from './detectRegistry';
import { log, logEnable, logStream } from './log';
import { pathExists, readJson } from 'fs-extra';

export async function packCurrentVersion(cwd: string) {
	let result: string;
	log('Build local package...');
	const pm = await getPackageManager();
	log('  use package manager: %s', pm);

	const outputStream = logEnable ? process.stderr : 'ignore';

	let cmd: string;
	if (pm === 'yarn') {
		cmd = pm + ' pack --json';
		log('+ ' + cmd);
		const r = command(cmd, { cwd, stdout: 'pipe', stderr: outputStream });
		const output = await collectOutput(r.stdout!);
		const resultLine = /^{.*"type":"success".*}$/m.exec(output);
		if (!resultLine) {
			throw new Error('Failed to run yarn pack.');
		}
		const ret = JSON.parse(resultLine[0]);
		result = ret.data.replace(/^Wrote tarball to "/, '').replace(/"\.$/, '');
	} else {
		const prepackExists = !!(await readJson(resolve(cwd, 'package.json'))).scripts?.prepack;
		if (prepackExists) {
			cmd = pm + ' run prepack';
			log('+ ' + cmd);
			await command(cmd, { cwd, stdout: outputStream, stderr: outputStream });
		}

		cmd = pm + ' pack';
		log('+ ' + cmd);
		const r = command(cmd, { cwd, stdout: 'pipe', stderr: outputStream });
		const fname = await collectOutput(r.stdout!);
		result = resolve(cwd, fname.trim());
	}

	if (!pathExists(result)) {
		throw new Error('File [' + result + '] must exists after pack.');
	}

	return result;
}

async function collectOutput(stdout: NodeJS.ReadableStream) {
	const p = stdout.pipe(new PassThrough());
	const coll = new CollectingStream(p);
	logStream(p);

	return await coll.promise();
}
