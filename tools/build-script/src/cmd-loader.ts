import { fancyLog } from './common/fancyLog';

class ExitError extends Error {
	constructor(message: string, public readonly code: number = 1) {
		super(message);
	}
}

export function fatalError(msg: string): never {
	throw new ExitError(msg);
}

if (/build-script/.test(process.env.NODE_DEBUG || '')) {
	const exit = process.exit;
	process.exit = (code?: number | undefined): never => {
		console.trace('exit with code ' + code);
		exit(code);
		throw new Error('impossible');
	};
}

export function load(file: string) {
	Promise.resolve().then(() => {
		return require(file).default();
	}).then(() => {
	}, (e) => {
		if (e instanceof ExitError) {
			fancyLog.error(e.message);
			process.exit(1);
		}

		const stack = e.stack.split(/\n/);
		if (stack.length > 3) {
			stack.pop(); // root file
			stack.pop(); // function main()
		}
		if (process.stderr.isTTY) {
			fancyLog.error('\x1B[38;5;9m%s\x1B[0m', stack.join('\n'));
		} else {
			fancyLog.error(stack.join('\n'));
		}
		process.exit(e.code || 1);
	});
}
