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

function isPathMap(exportsField: IExportCondition | IExportMap): exportsField is IExportMap {
	return Object.keys(exportsField).some((e) => e.startsWith('.'));
}
export function parseExportsField(exports: IExportsField): IFullExportsField {
	if (typeof exports === 'string') {
		return { '.': { default: exports } };
	}
	if (!isPathMap(exports)) {
		return { '.': exports };
	}
	let ret: IFullExportsField = {};
	for (const [path, def] of Object.entries(exports)) {
		if (typeof def === 'string') {
			ret[path] = { default: def };
		} else {
			ret[path] = def;
		}
	}
	return ret;
}

// export function resolveImport(exports:IFullExportsField, file:string,platform:string, condition: string){
// }

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
	[field: string]: any;
}
