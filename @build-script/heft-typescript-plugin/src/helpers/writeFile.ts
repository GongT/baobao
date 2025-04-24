import type { IHeftTaskSession } from '@rushstack/heft';
import { basename, dirname } from 'node:path';
import type TypeScriptApi from 'typescript';
import type { IHeftJsonOptions } from './type.js';

interface IFileWriter {
	files: number;
	writeFile: TypeScriptApi.WriteFileCallback;
}

export function createFileWriter(ts: typeof TypeScriptApi, session: IHeftTaskSession, options: IHeftJsonOptions) {
	const context: IFileWriter = { files: 0 } as any;
	context.writeFile = writeFile.bind(context, ts, session, options);
	return context;
}

export function writeFile(
	this: IFileWriter,
	ts: typeof TypeScriptApi,
	session: IHeftTaskSession,
	options: IHeftJsonOptions,
	fileName: string,
	text: string,
	writeByteOrderMark: boolean,
	onError?: (message: string) => void,
	_sourceFiles?: readonly TypeScriptApi.SourceFile[],
	_data?: TypeScriptApi.WriteFileCallbackData
) {
	const dir = dirname(fileName);
	const base = basename(fileName);
	const newBase = base
		.replace(/\.jsx?(\.map$|$)/i, `${options.extension}$1`)
		.replace(/\.d\.ts(\.map$|$)/i, `.d${options.extension.replace('js', 'ts')}$1`);
	session.logger.terminal.writeVerboseLine(`   * write: ${dir}/{${base} => ${newBase}}`);

	if (newBase.endsWith('.map')) {
		const mapData = JSON.parse(text);
		if (mapData.file) {
			if (base.endsWith('.d.ts.map')) {
				mapData.file = mapData.file.replace(/\.d\.ts$/i, `.d${options.extension.replace('js', 'ts')}`);
			} else {
				mapData.file = mapData.file.replace(/\.js(x?)$/i, `${options.extension}$1`);
			}
		} else {
			(onError || session.logger.terminal.writeWarningLine)(`sourcemap file ${dir}/${newBase} did not contains file.`);
		}
		text = JSON.stringify(mapData, null, 4);
	} else {
		if (/\.jsx?$/.test(base)) {
			text = text.trimEnd();
			const lastLineAt = text.lastIndexOf('\n');
			let lastLine = text.slice(lastLineAt + 1);
			const re = /\.js(x?\.map)$/;
			if (re.test(lastLine)) {
				lastLine = lastLine.replace(re, `${options.extension}$1`);
				text = `${text.slice(0, lastLineAt)}\n${lastLine}\n`;
			} else {
				(onError || session.logger.terminal.writeWarningLine)(`inline sourcemap not supported. (${fileName})`);
			}
		}
	}

	// session.logger.terminal.writeVerboseLine(`[write-file] ${dir}/${newBase}`);
	this.files++;
	return ts.sys.writeFile(`${dir}/${newBase}`, text, writeByteOrderMark);
}
