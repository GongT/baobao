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
	exports: string | Record<string, string | Record<string, string>>;
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
