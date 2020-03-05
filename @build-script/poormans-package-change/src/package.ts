import { CollectingStream } from '@idlebox/node';
import { command } from 'execa';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { getPackageManager } from './detectRegistry';
import { log, logEnable, logStream } from './log';

export async function packCurrentVersion(cwd: string) {
	log('create package...');
	const pm = await getPackageManager();
	log('  use package manager: %s', pm);
	let cmd: string;
	if (pm === 'yarn') {
		cmd = pm + ' pack --json';
		log('+ ' + cmd);
		const r = command(cmd, { cwd, stdout: 'pipe', stderr: 'pipe' });
		const p = r.stdout!.pipe(new PassThrough());
		const coll = new CollectingStream(p);
		logStream(p);
		logStream(r.stderr!);
		const output = await coll.promise();
		const resultLine = /^{.*"type":"success".*}$/m.exec(output);
		if (!resultLine) {
			throw new Error('Failed to run yarn pack.');
		}
		const ret = JSON.parse(resultLine[0]);
		return ret.data.replace(/^Wrote tarball to "/, '').replace(/"\.$/, '');
	} else {
		cmd = pm + ' run prepack';
		log('+ ' + cmd);
		await command(cmd, { cwd, stdout: logEnable ? process.stderr : 'ignore', stderr: 'inherit' });

		cmd = pm + ' pack';
		log('+ ' + cmd);
		const r = command(cmd, { cwd, stdout: 'pipe', stderr: 'pipe' });
		const p = r.stdout!.pipe(new PassThrough());
		const coll = new CollectingStream(p);
		logStream(p);
		logStream(r.stderr!);
		const fname = await coll.promise();
		return resolve(cwd, fname.trim());
	}
}
