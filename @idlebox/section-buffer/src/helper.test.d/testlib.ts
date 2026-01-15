import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isLinux } from '@idlebox/common';

export const kb = 1024;
export const mb = 1024 * kb;

export function randomTestFile(file: string, size: number) {
	if (statSyncTry(file)?.size !== size) {
		const test100 = Buffer.allocUnsafe(size);
		test100[0] = Math.random() * 256;
		for (let i = 1; i < test100.length; i++) {
			test100[i] = test100[i - 1] + 1;
		}
		writeFileSync(file, test100);
		return test100;
	}
	return readFileSync(file);
}

const mytestDir = resolve(process.cwd(), 'temp/my-test');
export const tmpdir = isLinux ? '/dev/shm/big-test' : mytestDir;
mkdirSync(tmpdir, { recursive: true });
if (isLinux) {
	if (!existsSync(mytestDir)) symlinkSync(tmpdir, mytestDir);
}

export function statSyncTry(file: string) {
	try {
		return statSync(file);
	} catch (_e) {
		return undefined;
	}
}

export function md5(data: Buffer) {
	return createHash('md5').update(data).digest('hex');
}

export function md5buff(data: Buffer) {
	return createHash('md5').update(data).digest();
}
