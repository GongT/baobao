import { addDisposableEventListener, registerGlobalLifecycle, type IDisposable } from '@idlebox/common';
import stringWidth from 'string-width';
import type tinycolor from 'tinycolor2';
import { tinygradient } from 'tinygradient';

const CSI = '\x1B[';
const g = tinygradient(['#5ee7df', '#b490ca']);

export class TerminalController {
	private spinner?: NodeJS.Timeout;
	private readonly disposeResizeEvent: IDisposable;
	private declare rows: number;
	private declare columns: number;
	private declare disabled: boolean;
	private lastline = '';
	private declare gradientArray: tinycolor.ColorFormats.RGB[];
	private gradientPosition = 0;
	private readonly fixedLines: string[] = [];

	constructor() {
		process.stderr.write('\n\n\n');
		registerGlobalLifecycle(this);
		this.disposeResizeEvent = addDisposableEventListener(process, 'SIGWINCH', this.onResize.bind(this));
		this.rollback(0);
		this.onResize();
	}

	private onResize() {
		[this.columns, this.rows] = process.stderr.getWindowSize();
		// this.columns -= 1;
		this.disabled = this.columns < 40 || this.rows < 6;
		this.gradientArray = g.hsv(this.columns * 0.7, 'short').map((ins) => ins.toRgb());
		this.gradientArray.push(...this.gradientArray.toReversed());
		this.lastLineCache = undefined;
		this.tick();
	}

	dispose() {
		this.disposeResizeEvent.dispose();
		this.setSpin(false);

		this.rollback(this.fixedLines.length + shutdownExtraErase);
		process.stderr.write(`\n`);
	}

	private rollback(lines = this.fixedLines.length) {
		if (lines) {
			process.stderr.write(`${CSI}${this.rows || 100}B${CSI}${lines}F${CSI}J`);
		} else {
			process.stderr.write(`${CSI}${this.rows || 100}B${CSI}J`);
		}
	}

	private refresh() {
		for (const line of this.fixedLines) {
			process.stderr.write(`${line}\n`);
		}

		this.tick();
	}

	private tick() {
		if (this.disabled) {
			process.stderr.write(`${this.lastline}\n`);
			return;
		}

		this.writeGradientText(this.exactLastLine);
	}

	private lastLineCache?: string;
	get exactLastLine() {
		if (!this.lastLineCache) this.lastLineCache = exactWidth(this.lastline, this.columns);
		return this.lastLineCache;
	}

	public setSpin(enabled: boolean) {
		if (this.spinner) {
			clearInterval(this.spinner);
			this.spinner = undefined;
		}

		if (enabled) {
			this.spinner = setInterval(
				() => {
					this.tick();
					this.gradientPosition = (this.gradientPosition + 1) % this.gradientArray.length;
				},
				Math.ceil(1000 / 60),
			);
		}
	}

	public line(char = '=') {
		console.log(''.padEnd(process.stderr.columns, char));
	}

	/**
	 * @param at starts from 1
	 */
	public writeLineAt(line: string, at: number) {
		const p = this.fixedLines.length;
		this.fixedLines[at - 1] = limitWidth(line, this.columns);
		this.rollback(p);
		this.refresh();
	}

	public setLastLine(line: string) {
		this.lastLineCache = undefined;
		this.lastline = line;
		this.tick();
	}

	private writeGradientText(text: string) {
		let output = '';

		let gradientIndex = this.gradientPosition;
		for (let txtIdx = 0; txtIdx < text.length; txtIdx++, gradientIndex++) {
			const { r, g, b } = this.gradientArray[gradientIndex % this.gradientArray.length];
			output += `${CSI}48;2;${r};${g};${b}m${text[txtIdx]}`;
		}

		// 重置颜色并输出
		output += `${CSI}0m\r`;
		process.stderr.write(output);
	}

	section(message: string, output: string) {
		if (this.fixedLines.length) {
			process.stderr.write(`${CSI}${this.fixedLines.length}F`);
		}
		process.stderr.write(`${CSI}J${CSI}38;5;9;7m${exactWidth(message, this.columns)}${CSI}0m\n${output}\n\n`);
		this.refresh();
	}

	print(message: string) {
		if (this.fixedLines.length) {
			process.stderr.write(`${CSI}${this.fixedLines.length}F`);
		}
		process.stderr.write(`${CSI}J${message}\n`);
		this.refresh();
	}
}

export function exactWidth(str: string, width: number) {
	while (true) {
		const w = stringWidth(str);
		if (w > width) {
			str = str.slice(0, -1);
		} else if (w < width) {
			str += ' ';
		} else {
			return str;
		}
	}
}

export function limitWidth(str: string, width: number) {
	while (true) {
		const w = stringWidth(str);
		if (w > width) {
			str = str.slice(0, -1);
		} else {
			return str;
		}
	}
}
