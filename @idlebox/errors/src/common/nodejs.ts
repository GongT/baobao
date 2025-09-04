import { NodeErrorCode } from '@idlebox/node-error-codes';
import { LinuxErrorCode } from '../codes/linux-error-codes.js';

type NodeException<T extends string = any> = NodeJS.ErrnoException & { code: T };

export interface OpenSSLException extends Error {
	opensslErrorStack?: string;
	function?: string;
	library?: string;
	reason?: string;
}

/**
 * MODULE_NOT_FOUND: require() not found
 * ERR_MODULE_NOT_FOUND: import() not found
 */
export function isModuleResolutionError(ex: unknown): ex is NodeException<NodeErrorCode.MODULE_NOT_FOUND | NodeErrorCode.ERR_MODULE_NOT_FOUND> {
	return isNodeError(ex) && (ex.code === NodeErrorCode.MODULE_NOT_FOUND || ex.code === NodeErrorCode.ERR_MODULE_NOT_FOUND);
}

export function isNotExistsError(e: unknown): e is NodeException<LinuxErrorCode.ENOENT> {
	return isNodeError(e) && e.code === LinuxErrorCode.ENOENT;
}

export function isExistsError(e: unknown): e is NodeException<LinuxErrorCode.EEXIST> {
	return isNodeError(e) && e.code === LinuxErrorCode.EEXIST;
}

/** @description use isFileTypeError */
export const isTypeError = isFileTypeError;

/**
 * 对文件夹readFile
 * 对文件readDir
 *
 * 会导致这种错误
 */
export function isFileTypeError(e: unknown): e is NodeException<LinuxErrorCode.EISDIR | LinuxErrorCode.ENOTDIR> {
	return isNodeError(e) && (e.code === LinuxErrorCode.EISDIR || e.code === LinuxErrorCode.ENOTDIR);
}

export function isNodeError(e: unknown): e is NodeException {
	return e instanceof Error && typeof (e as any).code === 'string';
}
