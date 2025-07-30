type StructString<Object> = string | Object;
type StringOr<Object> = string | Object;
type Person = StructString<{
	name: string;
	email: string;
	url: string;
}>;
type MaybeArray<T> = T | T[];
interface IOverridesObject {
	[packageName: string]: IOverrides;
}

type IOverrides = Record<string, string | IOverridesObject>;

export interface IExportCondition {
	node?: string | IExportCondition;
	'node-addons'?: string | IExportCondition;
	browser?: string | IExportCondition;
	require?: string;
	import?: string;
	types?: string;
	default?: string;
	[platform: string]: undefined | string | IExportCondition;
}

export interface IExportMap {
	[exportPath: string]: string | IExportCondition;
}
export interface IFullExportsField {
	[exportPath: string]: IExportCondition;
}

export type IExportsField = string | IExportCondition | IExportMap;
export type IImportsField = IExportCondition | IExportMap;

function isPathMap(exportsField: IExportCondition | IExportMap): exportsField is IExportMap {
	return Object.keys(exportsField).some((e) => e.startsWith('.'));
}
export function parseExportsField(exports: IExportsField): IFullExportsField {
	if (!exports) return {};

	if (typeof exports === 'string') {
		return { '.': { default: exports } };
	}
	if (!isPathMap(exports)) {
		return { '.': exports };
	}
	const ret: IFullExportsField = {};
	for (const [path, def] of Object.entries(exports)) {
		if (typeof def === 'string') {
			ret[path] = { default: def };
		} else {
			ret[path] = def;
		}
	}
	return ret;
}

export function resolveExportPath(exportField: string | IExportCondition, condition: readonly string[]) {
	if (!exportField || typeof exportField === 'string') {
		return exportField;
	}
	for (const cond of condition) {
		const value = exportField[cond];
		if (!value || typeof value === 'string') {
			return value;
		}

		return resolveExportPath(value, condition);
	}
	return undefined;
}

// export function resolveImport(exports:IFullExportsField, file:string,platform:string, condition: string){
// }

type PackageManagers = 'pnpm' | 'npm' | 'yarn' | string;

export interface IPackageJson {
	name: string;
	version: string;
	main: string;
	module: string;
	browser: string;
	description: string;
	keywords: string[];
	homepage: string;
	bugs: StructString<{ url: string; email: string }>;
	license: string;
	author: Person;
	contributors: Person[];
	funding: MaybeArray<StringOr<{ type: string; url: string }>>;
	files: string[];
	bin: StringOr<Record<string, string>>;
	man: MaybeArray<string>;
	packageManager: `${PackageManagers}@${string}`;
	directories: {
		bin: string;
		man: string;
		[name: string]: string;
	};
	repository: StructString<{
		type: string;
		url: string;
		directory: string;
	}>;
	scripts: Record<string, string>;
	config: Record<string, any>;
	overrides: IOverrides;
	engines: Record<string, string>;
	os: string[];
	cpu: string[];
	private: boolean;
	publishConfig: Record<string, any>;
	workspaces: string[];
	exports: IExportsField;
	imports: IImportsField;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	optionalDependencies: Record<string, string>;
	bundleDependencies: string[];
	peerDependencies: Record<string, string>;
	peerDependenciesMeta: Record<
		string,
		{
			optional: true;
			[option: string]: any;
		}
	>;

	dist: IPackageJsonNpmDist;

	/* My Addons */
	/**
	 * Array of dependencies that will remove from dependencies and devDependencies when resolving build order.
	 */
	decoupledDependencies: string | string[];
	/**
	 * Array of package names that add this package to it's `decoupledDependencies`.
	 */
	decoupledDependents: string | string[];
	/* My Addons End */

	[field: string]: any;
}

export interface IPackageJsonNpmDist {
	integrity: string;
	shasum: string;
	tarball: string;
	fileCount: number;
	unpackedSize: number;
	signatures: {
		keyid: string;
		sig: string;
	}[];
	size: number;
}
