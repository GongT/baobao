import { readFileSync } from 'fs';

export function readJsonSync(file: string) {
	return JSON.parse(readFileSync(file, 'utf-8'));
}
