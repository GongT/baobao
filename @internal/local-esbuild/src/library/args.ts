export const isFastMode = process.argv.includes('--fast');
export const isWatchMode = process.argv.includes('--watch');
export const entryFiles = new Map<string, string>();

for (const arg of process.argv.slice(2)) {
	if (arg === '--fast' || arg === '--watch') {
		continue;
	}
	if (arg.startsWith('-')) {
		throw new Error('Unknown argument: ' + arg);
	}

	const [from, to] = arg.split(':');
	entryFiles.set(from, to || 'lib');
}

if (entryFiles.size === 0) {
	throw new Error('missing entry-file arguments');
}
