declare module '@jspm/resolve' {
	interface IResolveResult {
		resolved: string;
		format: 'commonjs' | 'module' | 'json' | 'builtin' | 'addon' | 'unknown';
	}

	interface IOptions {
		env?: {
			browser?: boolean;
			node?: boolean;
			production?: boolean;
			dev?: boolean;
			'react-native'?: boolean;
			electron?: boolean;
			deno?: boolean;
			default?: boolean;
		};
		cjsResolve?: boolean;
		cache?: any;
	}

	function jspmResolve(specifier: string, parent: string, options?: IOptions): Promise<IResolveResult>;

	namespace jspmResolve {
		function sync(specifier: string, parent: string, options?: IOptions): IResolveResult;
	}

	export = jspmResolve;
}
