import type { IScopedLogger } from '@rushstack/heft';
import type TypeScriptApi from 'typescript';

import { inspect } from 'node:util';
import { type ModuleResolver, WantModuleKind } from './library/ModuleResolver.js';
import { tryGetSourceFile } from './library/util.js';

export function appendCallback(
	ts: typeof TypeScriptApi,
	extension: string,
	resolver: ModuleResolver,
	logger: IScopedLogger
) {
	let kind = WantModuleKind.ANY;
	if (extension === '.cjs') {
		kind = WantModuleKind.CJS;
	} else if (extension === '.mjs') {
		kind = WantModuleKind.ESM;
	}

	return (file: string, node: TypeScriptApi.Node) => {
		logger.terminal.writeDebugLine(`process file: ${file}`);
		const sourceFile = tryGetSourceFile(ts, node);
		if (!sourceFile) {
			if (file === 'tslib') {
				return file;
			}
			logger.terminal.writeWarningLine(` -> found node no source file import: ${file}`);
			return file;
		}
		const info = resolver.resolve(sourceFile.fileName, file, kind);
		if (!info.success) {
			logger.terminal.writeWarningLine(' -> found un-resolved import:', node.getText(), '\n\tat: ', file);
			return file;
		}

		if (info.isInternal) {
			logger.terminal.writeDebugLine(' -> ignore internal');
			return file;
		}
		if (info.isNodeModules) {
			logger.terminal.writeDebugLine(' -> ignore node_modules');
			return file;
		}

		let path = info.relativeToSelf();
		if (info.extension) path = path.slice(0, path.length - info.extension.length);

		if (path.includes('/node_modules/')) {
			logger.terminal.writeDebugLine(inspect(info, { colors: true }));
			throw new Error(`found node_modules in relative path: ${path}`);
		}

		const new_file = path + extension;
		if (new_file === file) {
			logger.terminal.writeDebugLine(` -> path is correct: ${file}`);
		} else {
			logger.terminal.writeDebugLine(` -> rename ${file} to ${new_file}`);
		}
		return new_file;
	};
}
