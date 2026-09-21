interface IBaseOptions {
	/**
	 * 默认文件路径
	 */
	readonly workspace?: string;
}

interface IBinaryOptions extends IBaseOptions {}

interface IApiOptions extends IBaseOptions {}

export type IBiomeFormatOptions = IBinaryOptions | IApiOptions;
