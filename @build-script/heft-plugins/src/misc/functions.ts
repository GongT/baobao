import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';

export function posixPath(p: string) {
	return p.replace(/\\/g, '/');
}
export function relativePath(from: string, to: string) {
	return posixPath(relative(from, to));
}

export function writeFileIfChange(file: string, data: string | Buffer) {
	if (existsSync(file)) {
		if (readFileSync(file, 'utf-8') === data) {
			return false;
		}
	}
	writeFileSync(file, data, 'utf-8');
	return true;
}

export function camelCase(str: string) {
	return str.replace(/[-.\/_][a-z]/g, (s) => {
		return s[1]!.toUpperCase();
	});
}

export function ucfirst<T extends string>(str: T): Capitalize<T> {
	return <any>(str[0]!.toUpperCase() + str.slice(1));
}

export function findUpUntilSync(from: string, file: string): string | null {
	for (let _from = resolve(from); _from !== '/'; _from = dirname(_from)) {
		const want = resolve(_from, file);
		if (existsSync(want)) {
			return want;
		}
	}

	const final = resolve('/', file);
	if (existsSync(final)) {
		return final;
	}

	return null;
}
