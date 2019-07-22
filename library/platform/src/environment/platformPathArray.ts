import { uniqueFilter } from '@idlebox/basic-helpers';
import { normalize, sep as PathListSep } from 'path';

export interface ProcessEnv {
	[key: string]: string | undefined;
}

export function findEnvironment(name: string, object: ProcessEnv = process.env) {
	const lname = name.toLowerCase();
	for (const key of Object.keys(object)) {
		if (key.toLowerCase() === lname) {
			return {
				key: key,
				value: object[key],
			};
		}
	}
	return undefined;
}

export function removeEnvironment(name: string, object: NodeJS.ProcessEnv = process.env) {
	const lname = name.toLowerCase();
	for (const key of Object.keys(object)) {
		if (key.toLowerCase() === lname) {
			delete object[key];
		}
	}
	return undefined;
}

export class PlatformPathArray {
	private current: string[];

	constructor(
		private readonly envName: string,
		private readonly env: ProcessEnv = {},
	) {
		const original = findEnvironment(envName, env);
		if (original) {
			removeEnvironment(original.key, env);
			env[envName] = original.value;
		}
		this.current = [];
		this.reload();
	}

	prepend(...paths: string[]) {
		this.reload();
		this.current.unshift(...paths);
		this.save();
	}

	append(...paths: string[]) {
		this.reload();
		this.current.push(...paths);
		this.save();
	}

	save() {
		this.current = this.current
			.map((item) => item.replace(/[\\\/]+$/, ''))
			.map(path => normalize(path))
			.filter(uniqueFilter());
		this.env[this.envName] = this.current.join(PathListSep);
	}

	private reload() {
		this.current = (this.env[this.envName] || '').split(PathListSep).filter(e => e.length > 0);
	}

	toString() {
		this.reload();
		return this.current.join(PathListSep);
	}

	[Symbol.iterator](): IterableIterator<string> {
		this.reload();
		return this.current[Symbol.iterator]();
	}
}
