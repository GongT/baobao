import { ExtensionContext } from 'vscode';
import { VSCodeFileLogger } from './logger.file';
import { stat, mkdirp, pathExists, writeFile, readFile, remove as removeRaw } from 'fs-extra';
import { resolve, dirname } from 'path';

function remove(dir: string) {
	console.warn('delete "%s"', dir);
	return removeRaw(dir);
}

export class ExtensionFileSystem {
	private declare context: ExtensionContext;
	private constructor() {}

	/** @internal */
	static create() {
		return new ExtensionFileSystem();
	}

	/** @internal */
	init(context: ExtensionContext) {
		this.context = context;
	}

	async createLog(name: string) {
		await mkdirp(this.context.logPath);
		const logger = VSCodeFileLogger._create(resolve(this.context.logPath, name + '.log'));
		this.context.subscriptions.push(logger);
	}

	getAsset(file: string) {
		return new FileContext(this.context.asAbsolutePath(file));
	}
	getGlobal(file: string) {
		return new FileContext(resolve(this.context.globalStoragePath, file));
	}
	getWorkspace(file: string) {
		if (!this.context.storagePath) {
			throw new Error('Not workspace context.');
		}
		return new FileContext(resolve(this.context.storagePath, file));
	}
}

class FileContext {
	constructor(private readonly fPath: string) {}

	get path() {
		return this.fPath;
	}

	async normalFile() {
		if (await pathExists(this.fPath)) {
			if (!(await stat(this.fPath)).isFile()) {
				await remove(this.fPath);
			}
		}
	}

	async isFileExists() {
		if (!this.fPath) return false;
		return (await pathExists(this.fPath)) && (await stat(this.fPath)).isFile();
	}

	async readText() {
		await this.normalFile();
		if (await pathExists(this.fPath)) {
			return await readFile(this.fPath, 'utf-8');
		} else {
			return '';
		}
	}

	async readJson() {
		const content = await this.readText();
		try {
			return JSON.parse(content);
		} catch (e) {
			return null;
		}
	}

	async writeText(data: string) {
		if ((await this.readText()) === data) {
			return false;
		}
		await this.writeTextForce(data);
		return true;
	}
	async writeTextForce(data: string) {
		await this.normalFile();
		mkdirp(dirname(this.fPath));
		console.log(`write file ${this.fPath}`);
		await writeFile(this.fPath, data);
	}
	writeJson(data: any) {
		return this.writeText(JSON.stringify(data));
	}
	writeJsonForce(data: any) {
		return this.writeTextForce(JSON.stringify(data));
	}

	async createDirectory() {
		if (await pathExists(this.fPath)) {
			if ((await stat(this.fPath)).isDirectory()) {
				return;
			} else {
				await remove(this.fPath);
			}
		}
		await mkdirp(this.fPath);
	}

	async remove() {
		if (await pathExists(this.fPath)) {
			await remove(this.fPath);
			return true;
		} else {
			return false;
		}
	}
}
