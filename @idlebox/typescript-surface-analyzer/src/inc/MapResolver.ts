import { existsSync } from 'node:fs';
import { basename, dirname, extname, relative, resolve } from 'node:path';

const inspectSymbol = Symbol.for('nodejs.util.inspect.custom');
function addCustomInspect<T>(object: T, inspectFn: (this: T, depth: number, options: any) => string) {
	Object.defineProperty(object, inspectSymbol, {
		value: inspectFn,
		enumerable: false,
		configurable: true,
		writable: true,
	});
}

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

const jsFileExtensionRegex = /\.js$/;
const leadingSlashRegex = /^\//;
export class MapResolver {
	constructor(
		private readonly root: string,
		private readonly map?: Record<string, string[]>,
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
			const bb = base.replace(jsFileExtensionRegex, '');
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
					const mapped = `${to}/${dir.slice(from.length)}`.replace('//', '/').replace(leadingSlashRegex, '');

					const found = this.findOne(resolve(this.root, mapped), fileToTry);
					if (found) {
						return found;
					}
				}
			}
		}

		return '';
	}

	resolve(source: string, target: string): IResolveResult {
		const found = this._resolve(source, target);
		if (found) {
			const r: ILocalResolve = {
				type: 'file',
				absolute: found,
				relative: relative(dirname(source), found),
				relativeFromRoot: relative(this.root, found),
			};

			addCustomInspect(r, function () {
				return `File<${this.relativeFromRoot}>`;
			});
			return r;
		} else {
			const r: IExternalResolve = { type: 'dependency', name: target };
			addCustomInspect(r, function () {
				return `Dependency<${this.name}>`;
			});
			return r;
		}
	}

	convert(absolute: string): IResolveResult {
		const r: ILocalResolve = {
			type: 'file',
			absolute: absolute,
			relative: basename(absolute, extname(absolute)),
			relativeFromRoot: relative(this.root, absolute),
		};

		addCustomInspect(r, function () {
			return `File<${this.relativeFromRoot}>`;
		});

		return r;
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
