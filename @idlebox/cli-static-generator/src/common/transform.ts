import type * as e from 'acorn';
import MagicString from 'magic-string';
import type { Plugin } from 'rollup';
import { plogger } from './logger.js';

interface IState {
	command: boolean;
	main: boolean;
}

let alerted = false;

function alertSideEffectCode(file: string, code: string, _node: any) {
	if (alerted) return;
	alerted = true;

	plogger.warn(`警告: 除 Command类、 main函数 外有其他代码，这些代码在cli静态分析过程中会被跳过，这可能导致异常`);
	plogger.info` - 文件: long<${file}>`;

	const node: e.Node = _node;
	const text = code.slice(node.start, node.end);
	plogger.info(`代码片段:\n-------------------------------\n${text}\n-------------------------------`);
}

export function transformPlugin(files: readonly string[]): Plugin {
	return {
		name: 'idlebox:cli-static-generator:transform',

		transform(code, id) {
			if (id.includes('node_modules')) return null;
			if (!files.includes(id)) return null;

			const s = new MagicString(code);
			const state: Partial<IState> = {};

			try {
				// console.error('\x1Bctransform', id);
				const ast = this.parse(code);

				outer: for (const node of ast.body) {
					if (node.type === 'ExportNamedDeclaration') {
						if (node.declaration) {
							if (node.declaration.type === 'ClassDeclaration' && node.declaration.id.name === 'Command') {
								state.command = true;
								continue;
							} else if (node.declaration.type === 'FunctionDeclaration') {
								if (node.declaration.id.name === 'main') {
									state.main = true;
									removeNode(s, node);
									continue;
								}
							} else if (node.declaration.type === 'VariableDeclaration') {
								for (const decl of node.declaration.declarations) {
									if (decl.id.type === 'Identifier' && decl.id.name === 'main') {
										state.main = true;
										if (node.declaration.declarations.length === 1) {
											removeNode(s, node);
											continue outer;
										}
									}
								}
							}
						}

						alertSideEffectCode(id, code, node);
						removeNode(s, node);
					} else if (
						node.type === 'ImportDeclaration' ||
						node.type === 'ExportAllDeclaration' ||
						node.type === 'ClassDeclaration' ||
						node.type === 'FunctionDeclaration'
					) {
						// ignore
					} else {
						alertSideEffectCode(id, code, node);
						removeNode(s, node);
					}
				} // end ast walk

				if (!state.command) {
					throw new Error(`文件 ${id} 不导出 Command 类`);
				}
				if (!state.main) {
					throw new Error(`文件 ${id} 没有导出 main 函数`);
				}

				// console.log(s.toString());
				return {
					moduleSideEffects: false,
					code: s.toString(),
					map: s.generateMap({ hires: true, file: id }),
				};
			} catch (e: any) {
				e.message += ` (while parsing ${id})`;
				throw e;
			}
		},
	};
}

function removeNode(s: MagicString, _node: any) {
	const node: e.Node = _node;
	s.remove(node.start, node.end);
	// s.prependLeft(loc.start, `/* remove node ${node.type} `);
	// s.appendRight(loc.end, '*/');
}
