export function readPassword() {
	if (!process.stdin.isTTY) {
		return undefined;
	}

	const n = new Promise(function (resolve, reject) {
		let cache = Buffer.allocUnsafe(0);
		const reset = () => {
			process.stdin.removeListener('data', onData);
			process.stdin.removeListener('end', ok);
			process.stdin.pause();
			process.stdin.setRawMode(false);
		};
		const ok = () => {
			reset();
			resolve(cache.toString());
		};
		const onData = (b: Buffer) => {
			const enter = b.findIndex((c) => c === 0x0a || c === 0x0d || c === 0x03);
			const cancel = b.findIndex((c) => c === 0x04);
			if (enter !== -1) {
				cache = Buffer.concat([cache, b.slice(0, enter)]);
				ok();
			} else if (cancel !== -1) {
				reset();
				reject();
			} else {
				cache = Buffer.concat([cache, b]);
			}
		};
		process.stdin.on('data', onData);
		process.stdin.on('end', ok);
	});
	process.stderr.write('Enter password: ');
	process.stdin.resume();
	process.stdin.setRawMode(true);
	return n;
}
