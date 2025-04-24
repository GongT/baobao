import { platform } from 'node:os';
import { PathArray } from '@idlebox/common';
import { cleanupEnvironment, getEnvironment } from './getEnvironment.js';

export const PATH_SEPARATOR = platform() === 'win32' ? ';' : ':';
export class PathEnvironment extends PathArray {
	private readonly name: string;
	private readonly env: NodeJS.ProcessEnv;

	constructor(varName = platform() === 'win32' ? 'Path' : 'PATH', env: NodeJS.ProcessEnv = process.env) {
		const { name, value } = getEnvironment(varName, env);
		super('', PATH_SEPARATOR);

		this.name = name;
		this.env = env;

		if (value) super.add(value);
		cleanupEnvironment(varName);
	}

	override add(p: string) {
		const pSize = this.size;
		super.add(p);
		if (pSize !== this.size) {
			this.save();
		}
		return this;
	}
	override clear() {
		const change = this.size > 0;
		super.clear();
		if (change) this.save();
	}
	override delete(p: string) {
		if (super.delete(p)) {
			this.save();
			return true;
		}
		return false;
	}

	save() {
		this.env[this.name] = this.toString();
	}
}
