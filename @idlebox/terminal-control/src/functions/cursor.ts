import { sleep, TimeoutError } from '@idlebox/common';
import type { Terminal } from '../api.js';
import { DSR_RSP } from '../constants/regexp.js';
import { CSI, DSR } from '../constants/sequence.js';
import { CursorMove } from './cursor.move.js';

export class Cursor {
	public move;

	constructor(private readonly terminal: Terminal) {
		this.move = new CursorMove(terminal.stream);
	}

	private visible = true;
	public hide() {
		if (!this.visible) return;
		this.terminal.stream.write(`${CSI}?25l`);
		this.visible = false;
	}

	public show() {
		if (this.visible) return;
		this.terminal.stream.write(`${CSI}?25h`);
		this.visible = true;
	}

	public save() {
		this.terminal.stream.write(`${CSI}s`);
	}

	public restore() {
		this.terminal.stream.write(`${CSI}u`);
	}

	/**
	 * 向inputSide发送DSR请求，并等待响应以获取当前光标位置
	 *
	 * @param inputSide 用于接收DSR响应的可读流，通常是process.stdin
	 * @param timeout 等待响应的超时时间，单位毫秒，默认为1000ms
	 */
	public async getPosition(timeout = 1000): Promise<{ row: number; column: number }> {
		const read = this.terminal.requireReading();

		return new Promise((resolve, reject) => {
			sleep(timeout).finally(() => {
				reject(new TimeoutError(timeout, 'DSR'));
			});
			const onData = (data: Buffer) => {
				const str = data.toString();
				const match = str.match(DSR_RSP);
				if (match) {
					const row = parseInt(match[1], 10);
					const column = parseInt(match[2], 10);
					read.off('data', onData);
					resolve({ row, column });
				}
			};
			read.on('data', onData);
			this.terminal.stream.write(DSR);
		});
	}
}
