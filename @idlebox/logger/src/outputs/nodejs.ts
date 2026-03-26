import { Terminal } from '@idlebox/terminal-control';
import type { WriteStream } from 'node:tty';
import type { IInstrestedConsole } from '../common/types.js';
import { applyControllerByEnvironment } from './node-controllers/index.js';

function environmentColorEnabled(stream: NodeJS.WritableStream): boolean {
	// biome-ignore lint/performance/useTopLevelRegex: one time use
	const colorArgReg = /^--color=|^--color$|^-[^-]+c/;

	const colorArg = process.argv.find((e) => colorArgReg.test(e));
	const noColorArg = process.argv.includes('--no-color');

	// 命令行顶级优先
	if (noColorArg) return false;
	if (colorArg) return true;

	// 环境变量
	if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS === '1') {
		/**
		 * https://force-color.org/
		 * https://nodejs.org/docs/latest/api/cli.html#node_disable_colors1
		 */
		return false;
	} else if (process.env.FORCE_COLOR) {
		return true;
	}

	// 目标输出是TTY
	if ((stream as WriteStream).isTTY) {
		return true;
	}

	if (process.env.GITHUB_ACTIONS) {
		return true;
	}

	// TODO 检测其他可能

	return false;
}

interface IOptions {
	readonly stream: NodeJS.WritableStream;
	readonly colorEnabled?: boolean;
}

let instance: NodejsOutput | undefined;
export class NodejsOutput implements IInstrestedConsole {
	static defaultInstance(): IInstrestedConsole {
		if (!instance) {
			instance = new NodejsOutput({
				stream: process.stderr,
				colorEnabled: environmentColorEnabled(process.stderr),
			});
			applyControllerByEnvironment(instance);
		}
		return instance;
	}

	public readonly colorEnabled;
	public readonly stream;
	public readonly terminal;
	constructor({ stream, colorEnabled = false }: IOptions) {
		this.colorEnabled = colorEnabled;
		this.stream = stream;
		this.terminal = new Terminal(this.stream);

		this.error = this._writeLine.bind(this);
		this.warn = this._writeLine.bind(this);
		this.info = this._writeLine.bind(this);
		this.log = this._writeLine.bind(this);
		this.debug = this._writeLine.bind(this);
		this.trace = this._writeLine.bind(this);
	}

	clear(): void {
		this.terminal.resetIf(this.colorEnabled);
	}

	group(message: string): void {
		this.stream.write(`[${message}] START\n`);
	}

	groupCollapsed(message: string): void {
		this.stream.write(`[${message}] START (collapsed)\n`);
	}

	groupEnd(): void {
		this.stream.write(`[GROUP] END\n`);
	}

	readonly error: (message: string) => void;
	readonly warn: (message: string) => void;
	readonly info: (message: string) => void;
	readonly log: (message: string) => void;
	readonly debug: (message: string) => void;
	readonly trace: (message: string) => void;

	private _writeLine(message: string) {
		this.stream.write(`${message}\n`);
	}
}
