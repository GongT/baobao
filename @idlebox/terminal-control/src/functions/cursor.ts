import { CSI } from '../constants/sequence.js';

export * as move from './cursor.move.js';

let visible = true;
export function hide() {
	if (!visible) return;
	process.stderr.write(`${CSI}?25l`);
	visible = false;
}

export function show() {
	if (visible) return;
	process.stderr.write(`${CSI}?25h`);
	visible = true;
}

export function save() {
	process.stderr.write(`${CSI}s`);
}

export function restore() {
	process.stderr.write(`${CSI}u`);
}
