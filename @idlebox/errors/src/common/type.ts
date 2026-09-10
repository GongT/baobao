export interface IErrorOptions {
	/**
	 * 覆盖stack属性的边界函数
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
	 * 设为false时Error.stack属性为原始状态
	 *
	 * 设为任意值后，boundary在stack处理过程中不起作用
	 */
	stack?: string | false;
}
