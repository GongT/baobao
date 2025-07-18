import type { IMyLogger } from '@idlebox/logger';
import { Minimatch } from 'minimatch';
export type IIgnore = RegExp | string | MatchFn;
type MatchFn = (file: string) => boolean;

function matcher(reg: RegExp): MatchFn {
	const fn: MatchFn = (str) => reg.test(str);
	Object.assign(fn, { displayName: `RegExp(${reg.toString()})` });
	return fn;
}

function minimatcher(glob: string): MatchFn {
	const m = new Minimatch(glob);
	const fn: MatchFn = (str) => {
		return m.match(str);
	};
	Object.assign(fn, { displayName: `minimatch(${glob})` });
	return fn;
}

function nameof(fn: any) {
	return fn.displayName || fn.name || 'anonymous';
}

export class IgnoreFiles {
	private readonly ignores: MatchFn[] = [];

	constructor(private readonly logger: IMyLogger) {}

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

	public isIgnored(file: string) {
		return this.ignores.some((predicate) => {
			return predicate(file);
		});
	}

	public filter(files: readonly string[]) {
		this.logger.verbose('ignore rules: %s', this.ignores.length);
		for (const ignore of this.ignores) {
			this.logger.verbose('  - %s', nameof(ignore));
		}
		return files.filter((file) => {
			const ignore = this.ignores.find((predicate) => {
				return predicate(file);
			});
			if (ignore) {
				this.logger.debug('ignore by rule [%s]: %s', nameof(ignore), file);
				return false;
			}

			this.logger.verbose('not ignore file by rules: %s', file);
			return true;
		});
	}
}
