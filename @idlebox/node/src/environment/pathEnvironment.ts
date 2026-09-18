import { isWindows, PathArray } from '@idlebox/common';
import { cleanupEnvironment, getEnvironment } from './getEnvironment.js';

/**
 * 操作环境变量中的路径数组。所有操作都会自动同步到给定的对象上。
 */
export class PathEnvironment extends PathArray {
	private readonly name: string;
	private readonly env: NodeJS.ProcessEnv;

	/**
	 * @param varName 环境变量的名称，默认 'Path' 或 'PATH'
	 * @param env 环境变量对象，默认为 process.env
	 */
	constructor(varName = isWindows ? 'Path' : 'PATH', env: NodeJS.ProcessEnv = process.env) {
		const { name, value } = getEnvironment(varName, env);
		super('');

		this.name = name;
		this.env = env;

		// 必须在设置好env后才能添加初始路径，否则无法使用save()
		if (value) this.add(value);

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

	saveTo(env: NodeJS.ProcessEnv | Record<string, string>) {
		env[this.name] = this.toString();
	}
}
