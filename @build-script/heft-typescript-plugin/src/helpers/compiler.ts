import type { IScopedLogger } from '@rushstack/heft';
import { realpathSync } from 'node:fs';
import type TypeScriptApi from 'typescript';
import { crc32 } from 'node:zlib';

export class HostCreator {
	private readonly realpathCache = new Map<string, string>();
	private last?: {
		readonly host: TypeScriptApi.CompilerHost;
		readonly hash: number;
	};

	constructor(
		private readonly ts: typeof TypeScriptApi,
		private readonly logger: IScopedLogger
	) {}

	private cached_realpath(path: string) {
		let real = this.realpathCache?.get(path);
		if (real) return real;

		try {
			real = realpathSync(path);
		} catch {
			real = '';
		}

		this.logger.terminal.writeVerboseLine(`realpath(${path}) -> ${real}`);
		this.realpathCache?.set(path, real);

		return real;
	}

	public createCompilerHost(compilerOptions: TypeScriptApi.CompilerOptions): TypeScriptApi.CompilerHost {
		const hash = this.hashOptions(compilerOptions);
		if (this.last?.hash === hash) {
			return this.last.host;
		}
		this.logger.terminal.writeVerboseLine(`create compiler host: ${hash.toString(16)}`);

		const host = (compilerOptions.incremental ? this.ts.createIncrementalCompilerHost : this.ts.createCompilerHost)(
			compilerOptions
		);

		host.getEnvironmentVariable = (name: string) => process.env[name];
		host.realpath = this.cached_realpath.bind(this);

		return host;
	}

	private hashOptions(compilerOptions: TypeScriptApi.CompilerOptions) {
		return crc32(JSON.stringify(compilerOptions));
	}
}
