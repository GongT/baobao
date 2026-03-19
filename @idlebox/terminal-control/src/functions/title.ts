import { SoftwareDefectError, type IDisposable } from '@idlebox/common';
import { OSC, ST } from '../constants/sequence.js';

const parts: Array<{ order: number; value: string }> = [];

export interface ITitleControl extends IDisposable {
	update(title: string): void;
}

export function clear() {
	if (nextTimer) clearTimeout(nextTimer);
	nextTimer = undefined;

	if (parts.length === 0) return;

	parts.length = 0;
	flush();
}

export function addComponent(order: number = -1): ITitleControl {
	const self = { order, value: '' };
	if (order >= 0) {
		const insertAfterIndex = parts.findLastIndex(({ order: partOrder }) => {
			return order >= partOrder;
		});
		parts.splice(insertAfterIndex + 1, 0, self);
	} else {
		const last = parts.at(-1)?.order ?? 0;
		self.order = last;
		parts.push(self);
	}

	return {
		dispose() {
			const index = parts.indexOf(self);
			if (index === -1) return;

			this.update = () => {
				throw new SoftwareDefectError('title controller is disposed');
			};
			parts.splice(index, 1);
			emitTitle();
		},
		update(title: string) {
			if (title === self.value) return;

			self.value = title;
			emitTitle();
		},
	};
}

let nextTimer: NodeJS.Timeout | undefined;
function emitTitle() {
	if (nextTimer) return;
	nextTimer = setTimeout(() => {
		flush();
		nextTimer = undefined;
	}, 0);
	nextTimer.unref();
}

function flush() {
	if (parts.length === 0) {
		process.stderr.write(`${OSC}0; ${ST}${OSC}0;${ST}`);
	} else {
		process.stderr.write(`${OSC}0;${parts.map(({ value }) => value).join('')}${ST}`);
	}
}

export const dispose = clear;
