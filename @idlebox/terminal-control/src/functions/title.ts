import type { IDisposable } from '@idlebox/common';
import { OSC, ST } from '../constants/sequence.js';

export interface ITitleControl extends IDisposable {
	update(title: string): void;
}

export class Title implements IDisposable {
	private readonly parts: Array<{ order: number; value: string; dispose(): void }> = [];

	constructor(private readonly stream: NodeJS.WritableStream) {}

	public clear() {
		if (this.nextTimer) clearTimeout(this.nextTimer);
		this.nextTimer = undefined;

		if (this.parts.length === 0) return;

		for (const { dispose } of this.parts) {
			dispose();
		}

		this.parts.length = 0;
		this.flush();
	}

	public addComponent(order: number = -1): ITitleControl {
		const self = {
			order,
			value: '',
			dispose: () => {
				control.revoke();
			},
		};
		if (order >= 0) {
			const insertAfterIndex = this.parts.findLastIndex(({ order: partOrder }) => {
				return order >= partOrder;
			});
			this.parts.splice(insertAfterIndex + 1, 0, self);
		} else {
			const last = this.parts.at(-1)?.order ?? 0;
			self.order = last;
			this.parts.push(self);
		}

		const control = Proxy.revocable<ITitleControl>(
			{
				dispose: () => {
					const index = this.parts.indexOf(self);
					if (index === -1) return;

					control.revoke();
					this.parts.splice(index, 1);
					this.emitTitle();
				},
				update: (title: string) => {
					if (title === self.value) return;

					self.value = title;
					this.emitTitle();
				},
			},
			{},
		);
		return control.proxy;
	}

	private nextTimer?: NodeJS.Timeout;
	private emitTitle() {
		if (this.nextTimer) return;
		this.nextTimer = setTimeout(() => {
			this.flush();
			this.nextTimer = undefined;
		}, 0);
		this.nextTimer.unref();
	}

	private active = false;
	private flush() {
		if (this.parts.length === 0) {
			if (this.active) {
				this.stream.write(`${OSC}0; ${ST}${OSC}0;${ST}`);
			}
		} else {
			this.active = true;
			this.stream.write(`${OSC}0;${this.parts.map(({ value }) => value).join('')}${ST}`);
		}
	}

	public readonly dispose = this.clear;
}
