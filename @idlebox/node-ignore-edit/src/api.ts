import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { arrayUniqueReference } from '@idlebox/common';

export const unscoped = Symbol('unscoped');
const filePath = Symbol('file-path');
const originalContent = Symbol('original-content');
const EMPTYLINE = '@idebox/ignore/space';

export function emptyLine() {
	const s = Symbol(EMPTYLINE);
	return s;
}

type ILine = symbol | string;

export interface IIgnoreFile extends IIgnoreFileData, IIterable {}

interface IIgnoreFileData {
	[unscoped]: ILine[];
	[filePath]?: string;
	[originalContent]: string;
	[title: string]: ILine[];
}

interface IIterable {
	[Symbol.iterator](): IterableIterator<[string | typeof unscoped, readonly string[]]>;
}

export function stringify(data: IIgnoreFile): string {
	let ret = '';
	// console.log('stringify:', data);
	for (const [item, arr] of data) {
		if (!arr || arr.length === 0) continue;

		if (item !== unscoped) {
			ret += '\n### ' + item + '\n';
		}

		ret +=
			arr
				.map((e) => {
					return isEmptyLine(e) ? '' : e;
				})
				.join('\n') + '\n';
	}
	return ret.trim() + '\n';
}

export function saveFile(data: IIgnoreFile, saveAs: string = data[filePath]!) {
	if (!saveAs) {
		throw new Error('not opened by loadFile(), use saveAs');
	}
	const result = stringify(data);
	if (result !== data[originalContent]) {
		writeFileSync(saveAs, result, 'utf-8');
		return true;
	} else {
		return false;
	}
}

function isEmptyLine(line: string | symbol) {
	if (typeof line === 'symbol') {
		if (line.description === EMPTYLINE) {
			return true;
		}
	}

	return false;
}

function trimLastEmptyLines(lines: (string | symbol)[]) {
	while (isEmptyLine(lines[lines.length - 1])) {
		lines.pop();
	}
}

function wrapProxy(instance: IIgnoreFileData, content: string): IIgnoreFile {
	const lines = content.split('\n').map((l) => l.trim());

	const sections: string[] = [];

	let current = instance[unscoped];
	for (const line of lines) {
		if (line.startsWith('###')) {
			trimLastEmptyLines(current);

			current = new WrappedArray();

			const section = line.slice(3).trim();

			sections.push(section);
			instance[section] = current;
		} else if (!line) {
			if (current.length > 0 && !isEmptyLine(current[current.length - 1])) {
				current.push(emptyLine());
			}
		} else {
			current.push(line);
		}
	}

	return new Proxy(instance as any, {
		get(_target, name: string | symbol) {
			if (typeof name === 'symbol') {
				if (name === Symbol.iterator) {
					const list = [unscoped, ...sections];
					return function* () {
						for (const i of list) yield [i, instance[i as any]];
					};
				}
				return (instance as any)[name];
			} else {
				if (!instance[name]) {
					instance[name] = new WrappedArray();
					sections.push(name);
				}
				return instance[name];
			}
		},
		set(_target, name: string, value: string[]) {
			if (!Array.isArray(value)) {
				throw new TypeError('invalid value (must be array)');
			}

			if (!(value instanceof WrappedArray)) value = new WrappedArray(...value);

			if (typeof name === 'symbol') {
				if (unscoped === name) {
					instance[unscoped] = value;
					return true;
				}

				throw new Error('do not support symbol index (except "unscoped")');
			}

			instance[unscoped] = value;
			return true;
		},
	});
}

export function parse(content: string): IIgnoreFile {
	const struct: IIgnoreFileData = {
		[unscoped]: new WrappedArray(),
		[originalContent]: content,
	};

	return wrapProxy(struct, content);
}

export function loadFile(file: string, create = false): IIgnoreFile {
	file = resolve(process.cwd(), file);

	if (create && !existsSync(file)) {
		writeFileSync(file, '');
	}

	const content = readFileSync(file, 'utf-8');

	const struct: IIgnoreFileData = {
		[unscoped]: new WrappedArray(),
		[originalContent]: content,
		[filePath]: file,
	};

	return wrapProxy(struct, content);
}

export class WrappedArray extends Array<string> {
	push(...items: string[]): number {
		if (items.length === 0) {
			return super.length;
		}

		arrayUniqueReference(items);

		let lastIndex = -1;
		for (const item of items) {
			const index = super.indexOf(item);
			if (index >= 0) {
				if (index < lastIndex) {
					super.splice(index, 1);
					super.splice(lastIndex + 1, 0, item);
				} else {
					lastIndex = index;
				}
			} else if (lastIndex === -1) {
				lastIndex = super.push(item) - 1;
			} else {
				lastIndex++;
				super.splice(lastIndex, 0, item);
			}
		}

		return super.length;
	}

	unshift(...items: string[]): number {
		if (items.length === 0) {
			return super.length;
		}

		arrayUniqueReference(items);

		let lastIndex = 0;
		for (const item of items) {
			const index = super.indexOf(item);
			if (index >= 0) {
				if (index < lastIndex) {
					super.splice(index, 1);
					super.splice(lastIndex + 1, 0, item);
				} else {
					lastIndex = index;
				}
			} else {
				lastIndex++;
				super.splice(lastIndex, 0, item);
			}
		}

		return super.length;
	}
	splice(start: number, deleteCount: number, ...items: string[]): string[] {
		const ret = super.splice(start, deleteCount);
		if (items.length === 0) {
			return ret;
		}

		arrayUniqueReference(items);

		let lastIndex = start;
		for (const item of items) {
			const index = super.indexOf(item);
			if (index >= 0) {
				if (index < lastIndex) {
					super.splice(index, 1);
					super.splice(lastIndex + 1, 0, item);
				} else {
					lastIndex = index;
				}
			} else {
				lastIndex++;
				super.splice(lastIndex, 0, item);
			}
		}

		return ret;
	}
}
