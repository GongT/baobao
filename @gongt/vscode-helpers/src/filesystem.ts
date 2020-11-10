import { resolve } from 'path';
import { promiseBool } from '@idlebox/common';
import { parseJsonText, stringifyJsonText } from '@idlebox/node-json-edit';
import { FileStat, FileSystem, FileType, Uri, workspace, WorkspaceFolder } from 'vscode';
import { context } from './context';
import { VSCodeFileLogger } from './logger.file';
import { logger } from './logger.ipc';
import { inspect } from 'util';

class ExtensionFileSystem {
	public fs: FileSystem = workspace.fs;

	async createLog(name: string) {
		await this.fs.createDirectory(context.logUri);
		const logger = VSCodeFileLogger._create(resolve(context.logPath, name + '.log'));
		context.subscriptions.push(logger);
	}

	getAsset(file: string) {
		return new FileContext(this, Uri.joinPath(context.extensionUri, file));
	}
	privateFileGlobal(file: string) {
		return new FileContext(this, Uri.joinPath(context.globalStorageUri, file));
	}
	privateFile(file: string) {
		if (!context.storageUri) {
			throw new Error('Not workspace context.');
		}
		return new FileContext(this, Uri.joinPath(context.storageUri, file));
	}

	absoluteFile(baseUri: Uri, file: string) {
		return new FileContext(this, Uri.joinPath(baseUri, file));
	}

	workspaceFile(workspace: WorkspaceFolder, file: string) {
		return new FileContext(this, Uri.joinPath(workspace.uri, file));
	}

	stat(uri: Uri): Promise<FileStat> {
		return Promise.resolve(this.fs.stat(uri));
	}
	readDirectory(uri: Uri): Promise<[string, FileType][]> {
		return Promise.resolve(this.fs.readDirectory(uri));
	}
	createDirectory(uri: Uri): Promise<void> {
		return Promise.resolve(this.fs.createDirectory(uri));
	}
	readFileRaw(uri: Uri): Promise<Uint8Array> {
		return Promise.resolve(this.fs.readFile(uri));
	}
	async readFile(uri: Uri, encoding?: null): Promise<Buffer>;
	async readFile(uri: Uri, encoding: BufferEncoding): Promise<string>;
	async readFile(uri: Uri, encoding: undefined | null | BufferEncoding): Promise<string | Buffer> {
		const buff = Buffer.from(await this.readFileRaw(uri));
		return encoding ? buff.toString(encoding) : buff;
	}
	writeFileRaw(uri: Uri, content: Uint8Array): Promise<void> {
		return Promise.resolve(this.fs.writeFile(uri, content));
	}
	writeFile(uri: Uri, content: ArrayBufferView, encoding?: null): Promise<void>;
	writeFile(uri: Uri, content: string, encoding: BufferEncoding): Promise<void>;
	writeFile(uri: Uri, content: string | ArrayBufferView, encoding: undefined | null | BufferEncoding): Promise<void> {
		const data =
			typeof content === 'string'
				? Buffer.from(content as string, (encoding as BufferEncoding) || 'utf-8')
				: Buffer.from(content);
		return Promise.resolve(this.fs.writeFile(uri, data));
	}
	delete(uri: Uri, options?: { recursive?: boolean; useTrash?: boolean }): Promise<void> {
		return Promise.resolve(this.fs.delete(uri, options));
	}
	rename(source: Uri, target: Uri, options?: { overwrite?: boolean }): Promise<void> {
		return Promise.resolve(this.fs.rename(source, target, options));
	}
	copy(source: Uri, target: Uri, options?: { overwrite?: boolean }): Promise<void> {
		return Promise.resolve(this.fs.copy(source, target, options));
	}
	async exists(uri: Uri): Promise<boolean> {
		const s = await this.stat(uri).catch(() => null);
		if (!s) return false;
		return (s.type & FileType.Unknown) > 0;
	}
	lexists(uri: Uri): Promise<boolean> {
		return promiseBool(this.stat(uri));
	}
	async isFile(uri: Uri) {
		const statp = this.stat(uri);
		if (await promiseBool(statp)) {
			const stat = await statp;
			return stat.type & FileType.File;
		} else {
			return false;
		}
	}
	async isDir(uri: Uri) {
		const statp = this.stat(uri);
		if (await promiseBool(statp)) {
			const stat = await statp;
			return stat.type & FileType.Directory;
		} else {
			return false;
		}
	}
	async isSymlink(uri: Uri) {
		const statp = this.stat(uri);
		if (await promiseBool(statp)) {
			const stat = await statp;
			return stat.type & FileType.SymbolicLink;
		} else {
			return false;
		}
	}
}

class FileContext {
	constructor(private readonly fs: ExtensionFileSystem, private readonly fPath: Uri) {}

	get path() {
		return this.fPath;
	}

	toString() {
		return this.fPath.toString();
	}
	[inspect.custom]() {
		return `<VSCodeFileContext ${this.fPath.toString(true)}>`;
	}

	resolve(...subPath: string[]) {
		return new FileContext(this.fs, Uri.joinPath(this.fPath, ...subPath));
	}

	async asNormalFile() {
		if (!(await this.fs.isFile(this.fPath))) {
			logger.warn(`delete file: ${this.fPath}`);
			await this.fs.delete(this.fPath, { recursive: true });
		}
		return this;
	}

	async asDirectory() {
		if (!(await this.fs.isDir(this.fPath))) {
			logger.warn(`delete folder: ${this.fPath}`);
			await this.fs.delete(this.fPath);
		}
		return this;
	}

	isFileExists() {
		return this.fs.isFile(this.fPath);
	}

	async readText() {
		if (await this.isFileExists()) {
			return this.fs.readFile(this.fPath, 'utf-8');
		} else {
			return '';
		}
	}

	/**
	 * @param comments Allow comment in json
	 * @throws when read failed or json parse error
	 */
	async readJson(comments: boolean = false): Promise<any> {
		const content = await this.readText();
		if (comments) {
			return parseJsonText(content);
		} else {
			return JSON.parse(content);
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
		this.fs.createDirectory(Uri.joinPath(this.fPath, '..'));
		await this.fs.writeFile(this.fPath, data, 'utf-8');
	}

	writeJson(data: any) {
		return this.writeText(stringifyJsonText(data));
	}
	writeJsonForce(data: any) {
		return this.writeTextForce(stringifyJsonText(data));
	}

	async delete() {
		if (await this.fs.exists(this.fPath)) {
			await this.fs.delete(this.fPath, { recursive: true });
			return true;
		} else {
			return false;
		}
	}
}

export const filesystem: ExtensionFileSystem = new ExtensionFileSystem();
