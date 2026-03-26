import { CSI } from '../constants/sequence.js';

export class CursorMove {
	constructor(private readonly stream: NodeJS.WritableStream) {}

	/**
	 * 光标向上移动n行
	 * 如果光标已经在第一行，则不移动。
	 * @param dist 默认1
	 */
	public up(dist: number = 1) {
		this.stream.write(`${CSI}${dist}A`);
	}

	/**
	 * 光标向下移动n行
	 * 如果光标已经在最后一行，则不移动。
	 * @param dist 默认1
	 */
	public down(dist: number = 1) {
		this.stream.write(`${CSI}${dist}B`);
	}

	/**
	 * 光标向右移动n列
	 * 如果光标已经在最后一列，则不移动。
	 * @param dist 默认1
	 */
	public forward(dist: number = 1) {
		this.stream.write(`${CSI}${dist}C`);
	}

	/**
	 * 光标向左移动n列
	 * 如果光标已经在第一列，则不移动。
	 * @param dist 默认1
	 */
	public backward(dist: number = 1) {
		this.stream.write(`${CSI}${dist}D`);
	}

	/**
	 * 光标向下移动n行，并将光标移动到第一列。
	 * 如果光标已经在最后一行，则不移动。
	 * @param dist 默认1
	 */
	public lineDown(dist: number = 1) {
		this.stream.write(`${CSI}${dist}E`);
	}

	/**
	 * 光标向上移动n行，并将光标移动到第一列。
	 * 如果光标已经在第一行，则不移动。
	 * @param dist 默认1
	 */
	public lineUp(dist: number = 1) {
		this.stream.write(`${CSI}${dist}F`);
	}

	/**
	 * 将光标移动到指定位置（row，col）。行和列的编号从1开始。
	 * 如果指定的位置超出终端的范围，则光标将移动到最接近的位置。
	 * @param row 行号，默认1
	 * @param col 列号，默认1
	 */
	public to(row: number, col: number = 1) {
		this.stream.write(`${CSI}${row};${col}H`);
	}

	/**
	 * 将光标移动到指定列（col）。列的编号从1开始。
	 * 如果指定的列超出终端的范围，则光标将移动到最接近的位置。
	 * @param col 列号，默认1
	 */
	public toX(col: number) {
		this.stream.write(`${CSI}${col}G`);
	}
}
