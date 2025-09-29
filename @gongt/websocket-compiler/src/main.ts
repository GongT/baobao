import { logger, type IArgsReaderApi } from '@idlebox/cli';
import { camelCase, ucfirst } from '@idlebox/common';
import { cancelDeleteTempfile, workingDirectory } from '@idlebox/node';
import { existsSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { ScriptKind, VariableDeclarationKind, type SourceFile } from 'ts-morph';
import pkgJson from '../package.json' with { type: 'json' };
import { analyzeExport } from './ts/analyze-export.js';
import { fatal } from './ts/error.js';
import { readInterface, type IMethodInfo } from './ts/read-interface.js';

const extension = /\.[cm]?[tj]s$/;

export async function websocketCompilerMain(args: IArgsReaderApi) {
	const input = args.single(['--input', '-i']);
	const output = args.single(['--output', '-o']);
	const debugLevel = args.flag(['--debug', '-d']);
	if (debugLevel >= 3) {
		cancelDeleteTempfile();
	}

	if (!input) throw new Error('需要指定 --input 参数');
	if (!output) throw new Error('需要指定 --output 参数');

	const cwd = workingDirectory.cwd();
	const inputPath = resolve(cwd, input);
	const inputDtsPath = inputPath.replace(extension, '.d.ts');
	const inputDtsMapPath = `${inputDtsPath}.map`;
	const outputPath = resolve(cwd, output);

	if (!existsSync(inputPath)) throw new Error(`输入文件 ${inputPath} 不存在`);
	if (!existsSync(inputDtsPath)) throw new Error(`输入文件 ${inputDtsPath} 不存在（是否开启了declaration？）`);
	if (!existsSync(inputDtsMapPath)) throw new Error(`输入文件 ${inputDtsMapPath} 不存在（是否开启了declarationMap？）`);

	const genComment = `/**
 * 本文件由工具自动生成，不要手动修改！
 * 生成工具: ${pkgJson.name}@${pkgJson.version}
 * 源文件: ${relative(dirname(outputPath), inputDtsPath)}
 */\n\n`;

	const { code, entryName, project, pushEvent } = analyzeExport(inputDtsPath);

	const parserSource = project.createSourceFile(resolve(outputPath, '../__temp.d.ts'), code, { overwrite: true, scriptKind: ScriptKind.TS });
	const entryClass = parserSource.getClassOrThrow(entryName);
	const metadata = readInterface(entryClass);

	let implCode = `import { WebsocketSender, type IRemoteInfo, WebsocketReceiver } from "@gongt/websocket";\n\n`;

	implCode += `/** 服务器调用器实现 */
export class RemoteImplement extends WebsocketSender implements ${entryName} {\n`;
	for (const [name, info] of Object.entries(metadata)) {
		// decl
		for (const decl of info.methodDeclarations) {
			implCode += '\tpublic ';
			implCode += decl.getText();
			implCode += '\n';
		}

		// impl
		const sender = info.returnPromise ? 'send_with_ack' : 'send';
		implCode += `\tpublic ${name}(...args:any) {\n`;
		implCode += `\t\treturn this.conn.${sender}('${name}', args, recv_metadata['${name}']);\n`;
		implCode += `\t}\n\n`;
	}
	implCode += `}\n`;
	implCode += `/** 客户端监听器实现 */
export class LocalImplement extends WebsocketReceiver {\n`;
	for (const [name, info] of Object.entries(pushEvent)) {
		const caller = `on${ucfirst(camelCase(name))}`;
		if (info.methodDeclarations.length > 1) {
			fatal(info.methodDeclarations[1], `事件 ${name} 有多个重载，无法生成代码`);
		}
		const decl = info.methodDeclarations[0];
		const t = decl.getReturnType().getText();
		implCode += `\tpublic ${caller}(handler: () => ${t}) {\n`;
		implCode += `\t\tthis.on('${name}', handler, push_metadata['${name}']);\n`;
		implCode += `\t}\n\n`;
	}
	implCode += `}\n`;

	const finalCode = `${genComment}${implCode}\n${code}\n`;
	const finalSource = project.createSourceFile(outputPath, finalCode, { overwrite: true, scriptKind: ScriptKind.TS });

	stringifyMetadata(finalSource, 'push', pushEvent, '/** 服务器主动推送事件 */\n');
	stringifyMetadata(finalSource, 'recv', metadata, '/** 客户端调用服务器事件 */\n');

	finalSource.organizeImports().saveSync();
	logger.success`输出文件 relative<${outputPath}>`;
}

function stringifyMetadata(source: SourceFile, what: string, meta: Record<string, IMethodInfo>, precomment: string = '') {
	const ename = ucfirst(camelCase(what));
	source.addEnum({
		name: `${ename}Events`,
		isExported: true,
		members: Object.keys(meta).map((name) => ({
			name: ucfirst(camelCase(name)),
			value: name,
		})),
		leadingTrivia: precomment,
	});

	let code = '{\n';
	for (const [name, info] of Object.entries(meta)) {
		const conv = {
			methodName: name,
			arguments: {
				length: info.arguments[0],
				optional: info.arguments[1],
			},
			hasAck: info.returnPromise,
		};
		const text = JSON.stringify(conv);
		code += `[${ename}Events.${ucfirst(camelCase(name))}]: ${text},\n`;
	}
	code += '}';

	source.addVariableStatement({
		isExported: true,
		declarationKind: VariableDeclarationKind.Const,
		declarations: [
			{
				name: `${what}_metadata`,
				type: `Record<${ename}Events, IRemoteInfo>`,
				initializer: code,
			},
		],
	});

	return {};
}
