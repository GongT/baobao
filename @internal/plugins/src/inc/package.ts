export interface IPackageJson {
	main: string;
	module: string;
	types: string;
	typings: string;
	exports: Record<string, string | Record<string, string>>;
}
