import { IDebug, ModuleResolver, tryGetSourceFile } from '@build-script/typescript-transformer-common';
import ts from 'typescript';

export function appendCallback(extension: string, resolver: ModuleResolver, logger: IDebug) {
	return (file: string, node: ts.Node) => {
		const sourceFile = tryGetSourceFile(node);
		if (!sourceFile) {
			logger.warn('found node no source file import:', file);
			return file;
		}
		const info = resolver.resolve(sourceFile.fileName, file);
		if (!info.success) {
			logger.warn('found un-resolved import:', node.getText(), '\n\tat: ', file);
			return file;
		}

		if (info.isInternal) {
			return file;
		}
		if (info.isNodeModules) {
			return file;
		}

		logger.debug(' -> rename %s to %s', file, info.relativeToSource + extension);
		return info.relativeToSource + extension;
	};
}
