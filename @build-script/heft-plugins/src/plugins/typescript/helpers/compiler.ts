import type { CancellationToken } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';

interface ICache {
	host: TypeScriptApi.CompilerHost;
	hostInc: TypeScriptApi.CompilerHost;
	moduleResolve: TypeScriptApi.ModuleResolutionCache;
	sourceFile: Map<string, TypeScriptApi.SourceFile>;
}

interface ICachedCompilerHost extends TypeScriptApi.CompilerHost {
	getSourceFile: TypeScriptApi.CompilerHost['getSourceFile'] & { cache?: Map<string, TypeScriptApi.SourceFile> };
}

const cache: Partial<ICache> = {};

function _changeCompilerHostToUseCache(compilerHost: ICachedCompilerHost) {
	if (!cache.sourceFile) cache.sourceFile = new Map();

	const { getSourceFile: innerGetSourceFile } = compilerHost;
	if (innerGetSourceFile.cache === cache.sourceFile) {
		return;
	}
	// Enable source file persistence
	const getSourceFile = (
		fileName: string,
		languageVersionOrOptions: TypeScriptApi.ScriptTarget,
		onError?: (message: string) => void,
		shouldCreateNewSourceFile?: boolean
	) => {
		if (!shouldCreateNewSourceFile) {
			const cachedSourceFile = cache.sourceFile!.get(fileName);
			if (cachedSourceFile) {
				return cachedSourceFile;
			}
		}
		const result = innerGetSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
		if (result) {
			cache.sourceFile!.set(fileName, result);
		} else {
			cache.sourceFile!.delete(fileName);
		}
		return result;
	};
	getSourceFile.cache = cache.sourceFile;
	compilerHost.getSourceFile = getSourceFile;
}

export function getCompilerHost(
	ts: typeof TypeScriptApi,
	compilerOptions: TypeScriptApi.CompilerOptions,
	cancellationToken: CancellationToken
) {
	let field: 'hostInc' | 'host';
	if (compilerOptions.incremental) {
		field = 'hostInc';
	} else {
		field = 'host';
	}

	if (!cache[field]) {
		const host = (compilerOptions.incremental ? ts.createCompilerHost : ts.createIncrementalCompilerHost)(
			compilerOptions
		);
		_changeCompilerHostToUseCache(host);

		host.getCancellationToken = (): TypeScriptApi.CancellationToken => {
			return {
				isCancellationRequested() {
					return cancellationToken.isCancelled;
				},
				throwIfCancellationRequested() {
					console.error('what is this?');
				},
			};
		};

		const mrCache = ts.createModuleResolutionCache(
			host.getCurrentDirectory(),
			host.getCanonicalFileName,
			compilerOptions,
			cache.moduleResolve?.getPackageJsonInfoCache()
		);
		cache.moduleResolve = mrCache;

		host.directoryExists = ts.sys.directoryExists;
		host.realpath = ts.sys.realpath;
		host.getDirectories = ts.sys.getDirectories;
		host.readDirectory = ts.sys.readDirectory;
		host.getModuleResolutionCache = () => mrCache;
		host.resolveModuleNameLiterals = resolveModuleNames(ts, compilerOptions, mrCache);
		host.resolveTypeReferenceDirectiveReferences;
		host.getEnvironmentVariable = (name: string) => process.env[name];
		// host.hasInvalidatedResolutions
		// host.getParsedCommandLine;

		cache[field] = host;
	}
	return cache[field]!;
}

function resolveModuleNames(
	ts: typeof TypeScriptApi,
	options: TypeScriptApi.CompilerOptions,
	cache: TypeScriptApi.ModuleResolutionCache
) {
	return (moduleNames: readonly TypeScriptApi.StringLiteralLike[], containingFile: string) => {
		return moduleNames.map((moduleName) => {
			const result = ts.resolveModuleName(
				moduleName.text,
				containingFile,
				options,
				{
					fileExists: ts.sys.fileExists,
					readFile: ts.sys.readFile,
				},
				cache
			);
			return result;
		});
	};
}
