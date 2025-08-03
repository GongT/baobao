import { NodeError } from '@idlebox/node-error-codes';
import { LinuxError } from './linux.js';
export * from '@idlebox/node-error-codes';

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
export function isModuleResolutionError(ex: unknown): ex is NodeException<NodeError.MODULE_NOT_FOUND | NodeError.ERR_MODULE_NOT_FOUND> {
	return isNodeError(ex) && (ex.code === NodeError.MODULE_NOT_FOUND || ex.code === NodeError.ERR_MODULE_NOT_FOUND);
}

export function isNotExistsError(e: unknown): e is NodeException<LinuxError.ENOENT> {
	return isNodeError(e) && e.code === LinuxError.ENOENT;
}

export function isExistsError(e: unknown): e is NodeException<LinuxError.EEXIST> {
	return isNodeError(e) && e.code === LinuxError.EEXIST;
}

/** @description use isFileTypeError */
export const isTypeError = isFileTypeError;

export function isFileTypeError(e: unknown): e is NodeException<LinuxError.EISDIR | LinuxError.ENOTDIR> {
	return isNodeError(e) && (e.code === LinuxError.EISDIR || e.code === LinuxError.ENOTDIR);
}

export function isNodeError(e: unknown): e is NodeException {
	return e instanceof Error && typeof (e as any).code === 'string';
}
