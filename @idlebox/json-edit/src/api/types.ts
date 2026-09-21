export interface IFormatter<OptType = any> {
	/**
	 * 格式化器需要根据文件内容，设置自身的options
	 */
	learnFile(filepath: string): Promise<void> | void;

	/**
	 * 根据文本内容，设置自身的options
	 */
	learnText(text: string): Promise<void> | void;

	/**
	 * 替换options
	 */
	setOptions(options: OptType): void;

	/**
	 * 获取当前的options
	 */
	getOptions(): OptType;

	/**
	 * 克隆当前格式化器实例
	 */
	clone(): IFormatter<OptType>;

	/**
	 * 格式化字符串或文件内容，返回格式化后的结果
	 * 不可写入文件
	 */
	format(content: string, filepath?: string): Promise<string>;
}

type MaybePromise<T> = T | Promise<T>;

export interface IFormatterConstructor<OptType> {
	(initialOptions?: OptType): MaybePromise<IFormatter<OptType> | null>;
}

export type JsonEditObject<T = any, FORMAT_OPT = any> = T & {
	readonly __private_do_not_use: {
		readonly ___json_edit_brand: unique symbol;
		readonly ___format_options: FORMAT_OPT;
	};
};
