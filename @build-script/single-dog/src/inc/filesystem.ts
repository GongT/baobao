import {
	chmodSync,
	ensureDirSync,
	existsSync,
	lstatSync,
	readFileSync,
	readlinkSync,
	removeSync,
	symlinkSync,
	writeFileSync,
} from 'fs/promises';
import { resolve } from 'path';
import { debug } from './debug';

export function uniqueArray(target: any[], source: any[]) {
	return target.concat(source).filter((value, index, self) => {
		return self.indexOf(value) === index;
	});
}

export class Filesystem {
	constructor(private readonly targetBase: string) {}

	get ROOT() {
		return this.targetBase;
	}

	overwrite(file: string, content: string, mode: string = '0644') {
		const abs = this.resolve(file);
		ensureDirSync(resolve(abs, '..'));
		if (existsSync(abs) && readFileSync(abs, 'utf8') === content) {
			return;
		}
		debug('\x1B[2m   writeFile(%s, FileContent<%s>)\x1B[0m', abs, content.length);
		writeFileSync(abs, content, 'utf8');
		chmodSync(abs, mode);
	}

	mergeIgnore(file: string, content: string) {
		debug('\x1B[2m   mergeIgnore: %s\x1B[0m', this.resolve(file));
		let original = this.readExists(file).trimRight() + '\n';
		const exists = original
			.split(/\n/)
			.map((e) => e.trim())
			.filter((e) => !!e);
		const lines = content
			.split(/\n/)
			.map((e) => e.trim())
			.filter((e) => !!e);

		for (const line of lines) {
			if (exists.includes(line)) {
				continue;
			}

			original += `${line}\n`;
		}

		this.overwrite(file, content);
	}

	linkFile(file: string, target: string) {
		const abs = this.resolve(file);
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

		debug('\x1B[2m  linkFile(%s, %s)\x1B[0m', abs, partsTarget.join('/'));
		const t = partsTarget.join('/');
		if (existsSync(abs)) {
			if (lstatSync(abs).isSymbolicLink() && readlinkSync(abs) === t) {
				return;
			}
		}
		removeSync(abs);
		symlinkSync(t, abs);
	}

	placeFile(file: string, content: string, mode: string = '0644') {
		const abs = this.resolve(file);
		debug('\x1B[2m   placeFile: %s\x1B[0m', abs);
		if (!this.exists(file)) {
			this.overwrite(file, content);
		}
		chmodSync(abs, mode);
	}

	readExists(file: string): string {
		const abs = this.resolve(file);
		if (existsSync(abs)) {
			return readFileSync(abs, 'utf8');
		} else {
			return '';
		}
	}

	resolve(file: string) {
		return resolve(this.targetBase, './' + file);
	}

	exists(file: string) {
		return existsSync(this.resolve(file));
	}
}
