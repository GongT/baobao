import type { IFormatter } from '@idlebox/json-edit';
import { commandInPath } from '@idlebox/node';
import { findBinary } from '@idlebox/package-bin';
import { execa } from 'execa';
import assert from 'node:assert/strict';
import { dirname, isAbsolute, resolve } from 'node:path';
import type { IBiomeFormatOptions } from './options.js';

let binaryPath: undefined | string | null;

export async function detectBinary() {
	if (binaryPath) return binaryPath;
	binaryPath = await findBinary('@biomejs/biome', import.meta.url, 'biome');

	if (!binaryPath) {
		binaryPath = (await commandInPath('biome')) || null;
	}

	return binaryPath;
}

export class BiomeBinaryFormat implements IFormatter<IBiomeFormatOptions> {
	constructor(protected current: IBiomeFormatOptions = {}) {
		assert.ok(binaryPath);
	}

	learnText(_text: string) {}
	learnFile() {}

	setOptions(options: IBiomeFormatOptions): void {
		this.current = options;
	}
	getOptions(): IBiomeFormatOptions {
		return this.current;
	}

	async format(content: string, filepath?: string): Promise<string> {
		const bin = await detectBinary();
		if (!bin) {
			return content;
		}

		let cwd;
		if (filepath) {
			cwd = dirname(filepath);
		} else if (this.current?.workspace) {
			cwd = this.current.workspace;
		} else {
			cwd = process.cwd();
		}
		if (filepath) {
			if (!isAbsolute(filepath)) {
				filepath = resolve(cwd, filepath);
			}
		} else {
			filepath = resolve(cwd, 'untitled.json');
		}

		const { stdout } = await execa(bin, ['format', `--stdin-file-path=${filepath}`], {
			stdin: Buffer.from(content, 'utf-8'),
			stdout: 'pipe',
			stderr: 'pipe',
			encoding: 'utf8',
			cwd: cwd,
		});

		return stdout;
	}

	clone(): IFormatter<IBiomeFormatOptions> {
		return new BiomeBinaryFormat({ ...this.current });
	}
}
