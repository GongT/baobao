export interface EnvMap {
	[id: string]: string;
}

export class PlatformPathArray {
	private current: string[];

	constructor(
		private readonly envName: string,
		private readonly env: EnvMap = {},
	) {
		const original = findEnvironment(envName, env);
		if (original) {
			removeEnvironment(original.key, env);
			env[envName] = original.value;
		}
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
			.filter(uniqueFilter(i => i));
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
