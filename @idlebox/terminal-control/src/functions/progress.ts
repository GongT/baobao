import type { IDisposable } from '@idlebox/common';
import { OSC, ST } from '../constants/sequence.js';

export class Progress implements IDisposable {
	private active = false;

	constructor(private readonly stream: NodeJS.WritableStream) {}

	public clear() {
		if (!this.active) return;

		this.stream.write(`${OSC}9;4;0;0${ST}`);
		this.active = false;
	}
	public update(percent: number) {
		this.stream.write(`${OSC}9;4;1;${percent.toFixed(0)}${ST}`);
		this.active = true;
	}
	public indeterminate() {
		this.stream.write(`${OSC}9;4;3${ST}`);
		this.active = true;
	}
	public error(percent: number = 0) {
		this.stream.write(`${OSC}9;4;2;${percent.toFixed(0)}${ST}`);
		this.active = true;
	}
	public warning(percent: number = 0) {
		this.stream.write(`${OSC}9;4;4;${percent.toFixed(0)}${ST}`);
		this.active = true;
	}

	public dispose() {
		this.clear();
	}
}
