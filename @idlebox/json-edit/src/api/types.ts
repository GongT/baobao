export interface IFormatter<OptType> {
	setOptions(options: OptType): void;
	getOptions(): OptType;
	format(content: string, filepath?: string): Promise<string>;
	clone(): IFormatter<OptType>;
}

export interface IFormatterConstructor<OptType> {
	new (): IFormatter<OptType>;
	createInstance(text?: string, file?: string): Promise<IFormatter<OptType>>;
}

export type JsonEditObject<T = any, FORMAT_OPT = any> = T & {
	readonly __private_do_not_use: {
		readonly ___json_edit_brand: unique symbol;
		readonly ___format_options: FORMAT_OPT;
	};
};
