import type { WorkspaceBase } from '@build-script/monorepo-lib';
import { logger as defaultLogger } from '@idlebox/cli';
import { registerGlobalLifecycle } from '@idlebox/common';
import { writeJsonFile } from '@idlebox/json-edit';
import { emptyDir } from '@idlebox/node';
import { randomBytes } from 'node:crypto';
import { rmSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { isDebugMode } from './functions/cli.js';
import { decompressPack } from './taball/decompress.js';

export class TempWorkingFolder {
	public readonly path: string;
	private _exists = false;

	constructor(
		private readonly workspace: WorkspaceBase,
		name: string,
		public readonly logger = defaultLogger,
		__internal_isChild = false,
	) {
		if (!__internal_isChild) {
			registerGlobalLifecycle(this);
			name += `-${randomBytes(6).toString('hex')}`;
		}
		this.path = resolve(workspace.temp, name);
	}

	resolve(p0: string, ...paths: string[]) {
		return new TempWorkingFolder(this.workspace, this.joinpath(p0, ...paths), this.logger, true);
	}

	joinpath(p0: string, ...paths: string[]) {
		const r = resolve(this.path, p0, ...paths);
		if (r.startsWith(this.path)) {
			return r;
		}
		throw new Error(`路径不在临时目录内: ${r}`);
	}

	async mkdir() {
		this.logger.debug`临时工作目录: long<${this.path}>`;
		await mkdir(this.path, { recursive: true });
		this._exists = true;
	}

	get exists() {
		return this._exists;
	}

	async createPackage(name: string, type: 'module' | 'commonjs', version = '0.0.0') {
		const packageJson = {
			name,
			version,
			type,
			dependencies: {},
		};
		const file = resolve(this.path, 'package.json');
		const data = JSON.stringify(packageJson, null, 4);
		await writeJsonFile(file, data);

		const tempDir = resolve(this.path, 'node_modules');
		await emptyDir(tempDir);

		return packageJson;
	}

	unpack(tarball: string, dest = '.') {
		return decompressPack(tarball, resolve(this.path, dest), this.logger);
	}

	dispose() {
		if (!isDebugMode) {
			this.logger.debug`  * 删除临时目录: long<${this.path}>`;
			rmSync(this.path, { force: true, recursive: true });
		} else {
			this.logger.debug`  * 由于是调试模式，不删除临时文件夹: long<${this.path}>`;
		}
	}
}
