import { CSI } from '../constants/sequence.js';

export class Erase {
	constructor(private readonly stream: NodeJS.WritableStream) {}

	/**
	 * 全屏消除
	 * 光标不会移动
	 *
	 * @param scrollback 如果为 true，则同时清除滚动缓冲区，否则仅清除当前可见屏幕
	 */
	public all(scrollback = false) {
		if (scrollback) {
			this.stream.write(`${CSI}3J`);
		} else {
			this.stream.write(`${CSI}2J`);
		}
	}

	/**
	 * 消除光标位置到屏幕末尾
	 * 光标不会移动
	 */
	public screenDown() {
		this.stream.write(`${CSI}J`);
	}

	/**
	 * 消除屏幕开头到光标位置
	 * 光标不会移动
	 */
	public screenUp() {
		this.stream.write(`${CSI}1J`);
	}

	/**
	 * 消除光标所在行
	 * 光标不会移动
	 */
	public line() {
		this.stream.write(`${CSI}2K`);
	}

	/**
	 * 消除光标位置到行末
	 */
	public forward() {
		this.stream.write(`${CSI}K`);
	}

	/**
	 * 消除行开头到光标位置
	 */
	public backward() {
		this.stream.write(`${CSI}1K`);
	}
}
