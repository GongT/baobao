import process from 'node:process';

const sourceMapSupportArg = /(^|\s)--enable-source-maps($|\s)/;

export function hasNativeSourceMapSupport() {
	return process.execArgv.includes('--enable-source-maps') || sourceMapSupportArg.test(process.env.NODE_OPTIONS ?? '');
}
