import { hexNumber } from './types';

export interface IMemCachePart {
	readonly buffer?: Uint8Array;
	readonly start: number;
	readonly length: number;
}

export interface IMemCacheEmit {
	readonly buffers: readonly Uint8Array[];
	readonly start: number;
	readonly totalSize: number;
}

interface IMemCacheDefrag {
	buffers?: Uint8Array[];
	start: number;
	end: number;
	length: number;
}
export interface IView {
	readonly start: number;
	readonly length: number;
	readonly written: boolean;
}

export class MemoryCacheController {
	private readonly list: IMemCacheDefrag[] = [];

	constructor(private readonly maxSize?: number) {}

	push({ length, start: starting, buffer }: IMemCachePart) {
		const ending = starting + length;

		if (length <= 0) throw new Error(`invalid buffer at 0x${starting.toString(16)}: empty`);
		if (starting < 0) throw new Error(`invalid buffer at ${starting} < 0`);
		if (buffer && length !== buffer.byteLength) throw new Error('invalid buffer state: length not equal');

		if (this.maxSize && ending > this.maxSize)
			throw new Error(`invalid buffer at 0x${starting.toString(16)}: overflow`);

		const newItem = {
			start: starting,
			length: length,
			end: ending,
			buffers: buffer ? [buffer] : undefined,
		};

		if (!this.list.length || this.list[0].start >= ending) {
			// before first
			this.list.unshift(newItem);
			this.merge(0);
			return;
		}

		for (let index = this.list.length - 1; index >= 0; index--) {
			// 1-3 5-7 9-11              3-5 / 20-30

			const current = this.list[index];
			if (starting < current.end) continue;

			const next = this.list[index + 1];
			if (next && ending > next.start)
				throw new Error(
					`invalid buffer at ${hexNumber(starting)} with size ${length}:` +
						` overlap with next at ${hexNumber(next.start)}`
				);

			this.list.splice(index + 1, 0, newItem);
			this.merge(index + 1);
			this.merge(index);
			return;
		}

		throw new Error(`invalid buffer at 0x${starting.toString(16)}: overlap with previous`);
	}

	private merge(left: number) {
		const curr = this.list[left];
		const next = this.list[left + 1];
		if (!curr || !next) return false;

		if (curr.end === next.start && !!curr.buffers === !!next.buffers) {
			curr.length += next.length;
			curr.end = next.end;

			if (curr.buffers) {
				curr.buffers.push(...next.buffers!);
			}
			this.list.splice(left + 1, 1);
			return true;
		} else {
			return false;
		}
	}

	check(from = 0, to = this.list.length) {
		from = Math.max(from, 0);
		to = Math.min(to, this.list.length);

		for (let index = from; index < to; index++) {
			const item = this.list[index];
			const next = this.list[index + 1];

			if (item.buffers) {
				let totalSize = 0;
				for (const buffer of item.buffers) {
					totalSize += buffer.byteLength;
				}

				if (totalSize !== item.length) {
					throw new Error(
						`invalid buffer at 0x${item.start.toString(16)}: length mismatch (${totalSize} != ${
							item.length
						})`
					);
				}
			}

			const thisEnding = item.start + item.length;
			if (next) {
				if (item.start >= next.start) {
					throw new Error(
						`invalid buffer at 0x${item.start.toString(16)}: wrong order, next is 0x${next.start.toString(
							16
						)}`
					);
				}
				if (thisEnding > next.start) {
					throw new Error(
						`invalid buffer at 0x${item.start.toString(16)}: overlap with next 0x${next.start.toString(16)}`
					);
				}
			} else if (this.maxSize) {
				if (thisEnding > this.maxSize) {
					throw new Error(`invalid buffer at 0x${item.start.toString(16)}: ending after end of file`);
				}
			}
		}
	}

	viewState(): IView[] {
		return this.list.map((item) => {
			return {
				start: item.start,
				length: item.length,
				written: !item.buffers,
			};
		});
	}

	isFullfilled() {
		if (!this.maxSize) throw new Error('file is indeterminate');

		let curr = 0;
		for (const { start, length } of this.list) {
			if (start !== curr) return false;

			curr += length;
		}
		if (curr !== this.maxSize) return false;
		return true;
	}

	size() {
		let size = 0;
		for (const item of this.list) {
			size += item.length;
		}
		return size;
	}

	memoryUsage() {
		let size = 0;
		for (const item of this.list) {
			if (!item.buffers) continue;
			for (const buffer of item.buffers) {
				size += buffer.byteLength;
			}
		}
		return size;
	}

	shift(): IMemCacheEmit | undefined {
		for (const [index, item] of this.list.entries()) {
			if (!item.buffers) continue;

			const ret = {
				buffers: item.buffers,
				start: item.start,
				totalSize: item.buffers.reduce((i, c) => i + c.byteLength, 0),
			};

			delete this.list[index].buffers;

			this.merge(index);
			this.merge(index - 1);

			// console.trace('[memcache] shift: %s chunk id=%s @%s', ret.buffers.length, index, hexNumber(item.start));

			return ret;
		}

		// console.log('[memcache] shift: empty memory');
		return undefined;
	}

	punchHole(_part: IMemCachePart) {
		throw new Error('Method not implemented.');
	}
}
