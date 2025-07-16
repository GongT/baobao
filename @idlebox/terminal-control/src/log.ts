import { format } from 'node:util';

const isTTY = process.stderr.isTTY;

function noop() {}

export const CSI = '\x1b[';
export function writeHostReplace(text: string) {
	process.stderr.write(`\r${CSI}K${text}${isQuiet ? '' : '\n'}`);
}
export function writeHost(text: string) {
	process.stderr.write(text);
}
export function writeHostLine(text: string) {
	process.stderr.write(`${text}\n`);
}

class Logger {
	private static instance: Logger;

	private constructor(private output: NodeJS.WritableStream | undefined) {
		if (isQuiet) {
			this.debug = noop;
		}

		process.on('log', (level: string, ...args: any[]) => {
			if (level === 'pause' || level === 'resume') {
				return;
			}
			if (level === 'error' || level === 'notice' || level === 'warn') {
				this.error(`[npm][${level}] %s`, args.join(' '));
			} else {
				this.debug(`[npm][${level}] %s`, args.join(' '));
			}
		});
	}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger(isQuiet ? undefined : process.stderr);
		}
		return Logger.instance;
	}

	log(msg: string, ...args: any[]) {
		if (this.output) {
			this.output.write(`${format(msg, ...args)}\n`);
		}
	}

	error(msg: string, ...args: any[]) {
		if (this.output) {
			this.log(msg, ...args);
		} else {
			console.error(msg, ...args);
		}
	}

	debug(msg: string, ...args: any[]) {
		if (isTTY) {
			this.log(`\x1B[0;2m${msg}\x1B[0m`, ...args);
		} else {
			this.log(msg, ...args);
		}
	}

	stream(source: NodeJS.ReadableStream) {
		if (this.output) {
			source.pipe(this.output, { end: false });
		}
	}

	line(char = '-') {
		this.log(char.repeat(process.stderr.columns || 40));
	}
}

export const logger = Logger.getInstance();
