import type { WriteStream } from 'node:tty';
import { debounce } from './functions.js';

export class Geometry {
	constructor(private readonly stream: WriteStream) {}

	get width() {
		return this.stream.columns || 80;
	}

	get height() {
		return this.stream.rows || 24;
	}

	onChange(fn: () => void) {
		const debouncedFn = debounce(fn);
		this.stream.on('resize', debouncedFn);
		this.stream.on('resize', debouncedFn);
	}
}
