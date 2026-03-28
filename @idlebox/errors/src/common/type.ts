export interface IErrorOptions {
	/**
	 * stack属性的边界函数
	 * @see {Error.captureStackTrace}
	 */
	boundary?: CallableFunction;

	/**
	 * cause属性的值
	 * @see {Error.cause}
	 */
	cause?: unknown;

	/**
	 * 替换stack
	 */
	stack?: string;
}
