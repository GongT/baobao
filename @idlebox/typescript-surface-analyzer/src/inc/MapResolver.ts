import { existsSync } from 'node:fs';
import { basename, dirname, extname, relative, resolve } from 'node:path';

interface ILocalResolve {
	type: 'file';
	absolute: string;
	relative: string;
	relativeFromRoot: string;
}
interface IExternalResolve {
	type: 'dependency';
	name: string;
}
export type IResolveResult = ILocalResolve | IExternalResolve;

export class MapResolver {
	constructor(
		private readonly root: string,
		private readonly map?: Record<string, string[]>
	) {}

	/**
	 * TODO: 需要node exports resolve
	 * @param source 
	 * @param target 
	 * @returns 
	 */
	private _resolve(source: string, target: string): string {
		const base = basename(target);
		const dir = dirname(target);
		const fileToTry = [base, `${base}.ts`, `${base}.tsx`];
		if (base.endsWith('.js')) {
			const bb = base.replace(/\.js$/, '');
			fileToTry.push(`${bb}.ts`, `${bb}.tsx`);
		}

		if (target.startsWith('.')) {
			source = resolve(this.root, source, '..');
			const found = this.findOne(resolve(source, dir), fileToTry);
			if (found) {
				return found;
			}
		} else if (this.map) {
			for (const [from, tos] of Object.entries(this.map)) {
				if (!dir.startsWith(from)) {
					continue;
				}

				for (const to of tos) {
					const mapped = `${to}/${dir.slice(from.length)}`.replace('//', '/').replace(/^\//, '');

					const found = this.findOne(resolve(this.root, mapped), fileToTry);
					if (found) {
						return found;
					}
				}
			}
		}

		return '';
	}

	resolve(source: string, target: string): IResolveResult | null {
		const found = this._resolve(source, target);
		if (found) {
			return {
				type: 'file',
				absolute: found,
				relative: relative(dirname(source), found),
				relativeFromRoot: relative(this.root, found),
			};
		}
		return null;
	}

	convert(absolute: string): IResolveResult {
		return {
			type: 'file',
			absolute: absolute,
			relative: basename(absolute, extname(absolute)),
			relativeFromRoot: relative(this.root, absolute),
		};
	}

	require(source: string, target: string): IResolveResult {
		const found = this.resolve(source, target);
		if (!found) throw new Error(`can not import ${target} from ${source}`);
		return found;
	}

	private findOne(dir: string, fileToTry: string[]) {
		for (const file of fileToTry) {
			const p = resolve(dir, file);
			if (existsSync(p)) {
				return p;
			}
		}
		return null;
	}
}
