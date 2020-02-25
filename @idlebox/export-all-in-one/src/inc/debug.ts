export const isDebug = /\bEXPORT\b/.test('' + process.env.NODE_DEBUG);

export function debug(msg: string, ...args: any[]) {
	if (isDebug) console.log(msg, ...args);
}
