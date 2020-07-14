import { ExtraSpawnOptions, spawn7z, spawnSfx } from './inc/fork';
import { I7zHandler } from './inc/handler';

/** @extern */
export function extractSfx(sfxFile: string, targetDir: string, extraSpawn?: ExtraSpawnOptions) {
	return new I7zHandler(spawnSfx(sfxFile, targetDir, extraSpawn));
}

/**
 * Wow such doge
 */
function _7Zip(cli: boolean, args: string[], ex?: ExtraSpawnOptions): I7zHandler {
	return new I7zHandler(spawn7z(args, cli, ex));
}

/** @extern */
export function sevenZip(ex: ExtraSpawnOptions, ...args: string[]): I7zHandler;
export function sevenZip(...args: string[]): I7zHandler;
export function sevenZip(...args: any[]) {
	let ex = undefined;
	if (typeof args[0] !== 'string') {
		ex = args.shift();
	}
	return _7Zip(false, args, ex);
}

/** @extern */
export function sevenZipCli(ex: ExtraSpawnOptions, ...args: string[]): I7zHandler;
export function sevenZipCli(...args: string[]): I7zHandler;
export function sevenZipCli(...args: any[]) {
	let ex = undefined;
	if (typeof args[0] !== 'string') {
		ex = args.shift();
	}
	return _7Zip(true, args, ex);
}

/** @extern */
export function extract(zipFile: string, targetDir: string) {
	return _7Zip(false, ['x', `-o${targetDir}`, '-y', zipFile]);
}

const defaultZipArgs = [
	'-y',
	'-ms=on', // create solid archive (default)
	'-mx8', // more compress
	'-mmt', // multithread the operation (faster)
	'-ssc', // case-sensitive mode
];

/** @extern */
export function compress(zipFile: string, sourceDir: string, ...extraSource: string[]) {
	return _7Zip(false, ['a', ...defaultZipArgs, zipFile, sourceDir, ...extraSource]);
}
