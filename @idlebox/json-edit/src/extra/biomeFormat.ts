import { findBinary } from '@idlebox/package-bin';
import { execa } from 'execa';
import { dirname } from 'node:path';
import type { IFormatter } from '../api/types.js';

interface ICfg {
	readonly workspace?: string;
}

let binaryPathPromise: undefined | Promise<string | null>;

function detectBinary() {
	if (binaryPathPromise) return binaryPathPromise;
	binaryPathPromise = findBinary('@biomejs/biome', import.meta.url).catch((e) => {
		console.error('Failed to detect Biome binary:', e);
		return null;
	});
	return binaryPathPromise;
}

export class BiomeBinaryFormat implements IFormatter<ICfg> {
	constructor(protected current: ICfg = {}) {}

	static createInstance(_text?: string, _file?: string): Promise<IFormatter<ICfg>> {
		return Promise.resolve(new BiomeBinaryFormat());
	}
	static readonly detectBinary = detectBinary;

	setOptions(options: ICfg): void {
		this.current = options;
	}
	getOptions(): ICfg {
		return this.current ?? {};
	}

	async format(content: string, filepath?: string): Promise<string> {
		const bin = await detectBinary();
		if (!bin) throw new Error('Biome binary not found');

		let cwd;
		if (filepath) {
			cwd = dirname(filepath);
		} else if (this.current?.workspace) {
			cwd = this.current.workspace;
		} else {
			cwd = process.cwd();
		}

		const { stdout } = await execa(bin, ['format', `--stdin-file-path=${filepath ?? 'untitled.json'}`], {
			stdin: Buffer.from(content, 'utf-8'),
			stdout: 'pipe',
			stderr: 'pipe',
			encoding: 'utf8',
			cwd: cwd,
		});
		return stdout;
	}
	clone(): IFormatter<ICfg> {
		return new BiomeBinaryFormat({ ...this.current });
	}
}
