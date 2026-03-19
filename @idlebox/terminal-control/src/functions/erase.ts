import { CSI } from '../constants/sequence.js';

/**
 * 全屏消除
 * 光标不会移动
 *
 * @param scrollback 如果为 true，则同时清除滚动缓冲区，否则仅清除当前可见屏幕
 */
export function all(scrollback = false) {
	if (scrollback) {
		process.stderr.write(`${CSI}3J`);
	} else {
		process.stderr.write(`${CSI}2J`);
	}
}

/**
 * 消除光标位置到屏幕末尾
 * 光标不会移动
 */
export function screenDown() {
	process.stderr.write(`${CSI}J`);
}

/**
 * 消除屏幕开头到光标位置
 * 光标不会移动
 */
export function screenUp() {
	process.stderr.write(`${CSI}1J`);
}

/**
 * 消除光标所在行
 * 光标不会移动
 */
export function line() {
	process.stderr.write(`${CSI}2K`);
}

/**
 * 消除光标位置到行末
 */
export function forward() {
	process.stderr.write(`${CSI}K`);
}

/**
 * 消除行开头到光标位置
 */
export function backward() {
	process.stderr.write(`${CSI}1K`);
}
