import { Program, SourceFile, TransformerFactory, CompilerOptions } from 'typescript';

class ExtensionCache {
	private readonly compileOptions: CompilerOptions;

	constructor(private readonly program: Program) {
		this.compileOptions = program.getCompilerOptions();
	}

	changed(program: Program): boolean {
		if (this.program === program) {
			// each file in single compile
			return false;
		}
		const compileOptions = program.getCompilerOptions();
		if (this.compileOptions === compileOptions) {
			// each compile (eg. watch mode)
			return false;
		}

		// anything changed, may re-create, up to plugin
		return true;
	}
}

export interface TransformerFactoryFactory<T> {
	(program: Program, extensionOptions: T): TransformerFactory<SourceFile>;
}
export function createExtensionWithCache<T = any>(creator: TransformerFactoryFactory<T>) {
	let cache: ExtensionCache;
	let cachedFactory: TransformerFactory<SourceFile>;
	return function extensionEntry(program: Program, extensionOptions: T) {
		if (cache && !cache.changed(program)) {
			return cachedFactory;
		}

		cache = new ExtensionCache(program);
		return (cachedFactory = creator(program, extensionOptions));
	};
}
