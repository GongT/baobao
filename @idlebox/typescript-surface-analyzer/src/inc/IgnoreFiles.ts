import { Minimatch } from 'minimatch';
import type { ILogger } from './logger.js';
export type IIgnore = RegExp | string | MatchFn;
type MatchFn = (file: string) => boolean;

function matcher(reg: RegExp): MatchFn {
	return (str) => reg.test(str);
}

function minimatcher(glob: string): MatchFn {
	const m = new Minimatch(glob);
	return (str) => {
		return m.match(str);
	};
}

export class IgnoreFiles {
	private readonly ignores: MatchFn[] = [];

	constructor(private readonly logger: ILogger) {}

	public add(ignore: IIgnore) {
		if (ignore instanceof RegExp) {
			this.ignores.push(matcher(ignore));
		} else if (typeof ignore === 'string') {
			this.ignores.push(minimatcher(ignore));
		} else if (typeof ignore === 'function') {
			this.ignores.push(ignore);
		} else {
			throw new TypeError(`invalid ignore type: ${typeof ignore}`);
		}
	}

	public clear() {
		this.ignores.length = 0;
	}

	public filter(files: readonly string[]) {
		return files.filter((file) => {
			const ignore = this.ignores.some((predicate) => {
				return predicate(file);
			});
			if (ignore) {
				this.logger.debug('ignore file by rules: %s', file);
				return false;
			}
			return true;
		});
	}
}
