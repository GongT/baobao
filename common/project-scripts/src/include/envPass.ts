import { TEMP_DIR } from './paths';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const envFile = resolve(TEMP_DIR, 'run-env.json');
export function writeEnv() {
	writeFileSync(envFile, JSON.stringify(process.env));
}

export function loadEnv() {
	if (process.env.LOAD_ENV_FILE) {
		delete process.env.LOAD_ENV_FILE;
		const envs = require(envFile);
		for (const [k, v] of Object.entries(envs)) {
			process.env[k] = v as string;
		}
	}
}
