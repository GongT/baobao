import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import { lstatSync, readlinkSync, symlinkSync } from 'fs';
import { ensureDirSync, existsSync, readFileSync, removeSync, writeFileSync } from 'fs-extra';
import { resolve } from 'path';
import { debug } from './debug';

export function uniqueArray(target: any[], source: any[]) {
	return target.concat(source).filter((value, index, self) => {
		return self.indexOf(value) === index;
	});
}

export class Filesystem {
	constructor(private readonly targetBase: string) {}

	overwrite(file: string, content: string) {
		const abs = resolve(this.targetBase, file);
		ensureDirSync(resolve(abs, '..'));
		if (existsSync(abs) && readFileSync(abs, 'utf8') === content) {
			return;
		}
		debug('writeFile(%s, FileContent<%s>)', abs, content.length);
		writeFileSync(abs, content, 'utf8');
	}

	mergeIgnore(file: string, content: string) {
		let original = this.readExists(file).trimRight() + '\n';
		const exists = original.split(/\n/).map(e => e.trim()).filter(e => !!e);
		const lines = content.split(/\n/).map(e => e.trim()).filter(e => !!e);

		for (const line of lines) {
			if (exists.includes(line)) {
				continue;
			}

			original += `${line}\n`;
		}

		this.overwrite(file, content);
	}

	linkFile(file: string, target: string) {
		const abs = resolve(this.targetBase, file);
		ensureDirSync(resolve(abs, '..'));

		const partsTarget = target.split(/[\/\\]/g);
		const partsFile = abs.split(/[\/\\]/g);
		while (partsTarget[0] === partsFile[0]) {
			partsTarget.shift();
			partsFile.shift();
			if (partsTarget.length === 0 || partsFile.length === 0) {
				throw new Error(`cannot resolve relative path of ${file} and ${target}`);
			}
		}
		const upFolders = partsFile.length - 1;
		partsTarget.unshift(...new Array(upFolders).fill('..'));

		debug('linkFile(%s, %s)', abs, partsTarget.join('/'));
		const t = partsTarget.join('/');
		if (existsSync(abs)) {
			if (lstatSync(abs).isSymbolicLink() && readlinkSync(abs) === t) {
				return;
			}
		}
		removeSync(abs);
		symlinkSync(t, abs);
	}

	placeFile(file: string, content: string) {
		if (!this.exists(file)) {
			this.overwrite(file, content);
		}
	}

	readExists(file: string): string {
		const abs = resolve(this.targetBase, file);
		if (existsSync(abs)) {
			return readFileSync(abs, 'utf8');
		} else {
			return '';
		}
	}

	resolve(file: string) {
		return resolve(this.targetBase, file);
	}

	exists(file: string) {
		const abs = resolve(this.targetBase, file);
		return existsSync(abs);
	}

	exec(command: string) {
		debug(command);
		const opt: ExecSyncOptionsWithStringEncoding = {
			encoding: 'utf8',
			cwd: CONTENT_ROOT,
			windowsHide: true,
		};
		return execSync(command, opt).trim();
	}
}
