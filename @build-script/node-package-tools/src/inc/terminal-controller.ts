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
	private lastline: string = '';
	private declare gradientArray: tinycolor.ColorFormats.RGB[];
	private gradientPosition: number = 0;
	private readonly fixedLines: string[] = [];

	constructor() {
		process.stderr.write(`${CSI}T`);
		registerGlobalLifecycle(this);
		this.disposeResizeEvent = addDisposableEventListener(process, 'SIGWINCH', this.onResize.bind(this));
		this.onResize();
	}

	private onResize() {
		[this.columns, this.rows] = process.stderr.getWindowSize();
		// this.columns -= 1;
		this.disabled = this.columns < 40 || this.rows < 6;
		this.gradientArray = g.hsv(this.columns, 'short').map((ins) => ins.toRgb());
		this.gradientArray.push(...this.gradientArray.toReversed());
		delete this.lastLineCache;
		this.tick();
	}

	dispose() {
		const erase = this.fixedLines.length + 1;
		process.stderr.write(`${CSI}${erase}F${CSI}J`);

		this.disposeResizeEvent.dispose();
		this.setSpin(false);
	}

	private tick() {
		process.stderr.write(`${CSI}${this.rows || 100}B${CSI}K`);
		if (this.disabled) {
			process.stderr.write(this.lastline + '\n');
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
			delete this.spinner;
		}

		if (enabled) {
			this.spinner = setInterval(
				() => {
					this.tick();
					this.gradientPosition++;
				},
				Math.ceil(1000 / 30)
			);
		}
	}

	public line(char: string = '=') {
		console.log(''.padEnd(process.stderr.columns, char));
	}

	/**
	 * @param at starts from 1
	 */
	public writeLineAt(line: string, at: number) {
		line = limitWidth(line, this.columns);
		if (this.disabled) {
			process.stderr.write(`${CSI}1F${CSI}K${line}${CSI}1E\n`);
		} else {
			process.stderr.write(`${CSI}${at}F${CSI}K${line}${CSI}${at}E`);
		}
		this.fixedLines[at - 1] = line;
	}

	public setLastLine(line: string) {
		delete this.lastLineCache;
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
		process.stderr.write(`${CSI}${this.fixedLines.length + 1}F${CSI}J`);
		process.stderr.write(`${CSI}38;5;9;7m${exactWidth(message, this.columns)}${CSI}0m\n${output}\n\n`);
		this.tick();
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
