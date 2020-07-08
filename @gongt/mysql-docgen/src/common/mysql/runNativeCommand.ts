import { spawn } from 'child_process';

export async function getDefaultArgs(): Promise<string[]> {
	const p = spawn('mysql', ['--print-defaults'], {
		stdio: ['ignore', 'pipe', 'inherit'],
	});

	const kill = () => {
		p.kill('SIGKILL');
	};

	process.on('exit', kill);

	const ret = await new Promise<string[]>((resolve) => {
		let cache = '';
		(p.stdout as NodeJS.ReadableStream).on('data', (buff, charset) => {
			cache += buff.toString(charset === 'buffer' ? 'utf-8' : charset);
		});
		p.once('exit', (code, signal) => {
			if (code !== 0 || signal) {
				resolve([]);
			} else {
				resolve(cache.split(/\s+/));
			}
		});
		p.on('error', () => {
			resolve([]);
		});
	});

	process.removeListener('exit', kill);

	return ret;
}
