import { existsSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { relativePath } from '@idlebox/node';

export interface IResolveResult {
	absolute: string;
	relative: string;
	relativeFromRoot: string;
}

export class MapResolver {
	constructor(private readonly root: string, private readonly map?: Record<string, string[]>) {}

	private _resolve(source: string, target: string): string {
		const base = basename(target);
		const dir = dirname(target);
		const fileToTry = [base, base + '.ts', base + '.tsx'];
		if (base.endsWith('.js')) {
			const bb = base.replace(/\.js$/, '');
			fileToTry.push(bb + '.ts', bb + '.tsx');
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
					const mapped = (to + '/' + dir.slice(from.length)).replace('//', '/').replace(/^\//, '');

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
				absolute: found,
				relative: relativePath(dirname(source), found),
				relativeFromRoot: relativePath(this.root, found),
			};
		}
		return null;
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
