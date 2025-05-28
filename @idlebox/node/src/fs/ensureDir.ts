import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function ensureDirExists(dir: string) {
	try {
		await mkdir(dir, { recursive: true });
	} catch (error) {
		console.error(`Error creating directory ${dir}:`, error);
	}
}

export async function ensureParentExists(file: string) {
	const dir = dirname(file);
	try {
		await mkdir(dir, { recursive: true });
	} catch (error) {
		console.error(`Error creating directory ${dir}:`, error);
	}
}
