declare interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare interface ImportMetaEnv extends Record<string, string | boolean | undefined> {
	readonly PROD: boolean;
	readonly DEV: boolean;
}
