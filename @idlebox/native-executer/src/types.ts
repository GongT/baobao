declare global {
	interface ILoaderState {
		dispose(): void;
		files?: ReadonlySet<string>;
	}
	var __ts_resolver_installed__: ILoaderState;
}
