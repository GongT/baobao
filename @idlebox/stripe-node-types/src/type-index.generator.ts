/// <reference types="nodejs-types" />

import type { FileBuilder, GenerateContext } from '@build-script/codegen';
import { SimpleStateMachine, type IPackageJson } from '@idlebox/common';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { join, relative, resolve } from 'node:path';

const selfPackage: IPackageJson = JSON.parse(readFileSync(resolve(import.meta.dirname, '../package.json'), 'utf-8'));
const collectedNodeModules = new Set(builtinModules);
const blacklist_modules = ['dns', 'fs', 'readline'];
const blacklist_prefix = '_not-use-node-type_';

export async function generate(context: GenerateContext) {
	const srcRoot = resolve(import.meta.dirname, '../node_modules/nodejs-types');
	for await (const item of glob('**/*', { cwd: srcRoot, withFileTypes: true })) {
		if (!item.isFile()) continue;

		const abs = join(item.parentPath, item.name);
		const rel = relative(srcRoot, abs);

		if (rel.includes('/node_modules/')) continue;

		const input = readFileSync(abs, 'utf-8');

		const output = context.file(`../lib/${rel}`, true);
		if (!abs.endsWith('.ts')) {
			if (rel === 'package.json') {
				const r: IPackageJson = JSON.parse(input);
				r.name = selfPackage.name;
				r.version = selfPackage.version;
				delete r.dependencies['undici-types'];
				output.append(JSON.stringify(r, null, 2));
			} else {
				output.append(input);
			}
			continue;
		}

		const done = await work(rel, input, output);
		if (!done) {
			output.append(input);
		}

		// const isBlackList = blacklist_modules.some((item) => rel === `${item}.d.ts`);
		// if (isBlackList) {
		// 	output.append('export {};');
		// }
	}

	const myShim = context.file('../lib/my-shim.d.ts', true);
	for (const item of collectedNodeModules) {
		if (item.startsWith('_') || item.startsWith('node:')) continue;
		myShim.append(`declare module "${item}";`);
	}
	for (const item of blacklist_modules) {
		myShim.append(`declare module "node:${item}";`);
	}

	const srcRoot2 = resolve(import.meta.dirname, '../node_modules/undici-types');
	for await (const item of glob('**/*', { cwd: srcRoot2, withFileTypes: true })) {
		if (!item.isFile()) continue;

		const abs = join(item.parentPath, item.name);
		const rel = relative(srcRoot2, abs);

		if (rel.includes('/node_modules/')) continue;

		const input = readFileSync(abs, 'utf-8');
		const output = context.file(`../lib/undici-types/${rel}`, true);
		if (!abs.endsWith('.ts')) {
			output.append(input);
			continue;
		}

		const text = replace_undici_imports(`undici-types/${rel}`, input);
		output.append(text);
	}
}

const moduleDeclaration = /^declare module ["'](?<name>[^"]+)["']/;
const isVersionedIndex = /^ts.*\/index\.d\.ts/;
const removeModules = ['fs', ''];
const hasIndent = /^\s+/;

async function work(fname: string, input: string, output: FileBuilder) {
	if (fname === 'index.d.ts') {
		output.append(input);
		output.append(`/// <reference path="./my-shim.d.ts" />`);
	} else if (isVersionedIndex.test(fname)) {
		output.append(input);
		output.append(`/// <reference path="../my-shim.d.ts" />`);
	} else {
		removeNoneNodejsProtocol(fname, input, output);
	}
	return true;
}

const protocolRemover = new Map();
enum PrState {
	Normal = 'normal',
	NormalUnrelated = 'normal-unrelated',
	ModuleWithProtocol = 'module-p',
	ModuleNoProtocol = 'module-r',
}
enum PrEvent {
	ProtocolHeader = 'header-p',
	NoProtocolHeader = 'header-r',
	ClosingTag = 'closing',
	OpeningTag = 'opening',
}

protocolRemover.set(
	PrState.Normal,
	new Map<PrEvent, PrState>([
		[PrEvent.ProtocolHeader, PrState.ModuleWithProtocol],
		[PrEvent.OpeningTag, PrState.NormalUnrelated],
		[PrEvent.NoProtocolHeader, PrState.ModuleNoProtocol],
		[PrEvent.NoProtocolHeader, PrState.ModuleNoProtocol],
	]),
);
protocolRemover.set(PrState.ModuleWithProtocol, new Map<PrEvent, PrState>([[PrEvent.ClosingTag, PrState.Normal]]));
protocolRemover.set(PrState.ModuleNoProtocol, new Map<PrEvent, PrState>([[PrEvent.ClosingTag, PrState.Normal]]));
protocolRemover.set(PrState.NormalUnrelated, new Map<PrEvent, PrState>([[PrEvent.ClosingTag, PrState.Normal]]));

async function removeNoneNodejsProtocol(fname: string, input: string, output: FileBuilder) {
	const sm = new SimpleStateMachine<PrState, PrEvent>(protocolRemover, PrState.Normal);

	const results: string[] = [];
	const hasProtocol: string[] = [];
	const noProtocol: string[] = [];

	const isBlackList = blacklist_modules.some((item) => fname === `${item}.d.ts`);

	for (let line of input.split('\n')) {
		try {
			if (moduleDeclaration.test(line)) {
				const name = moduleDeclaration.exec(line)!.groups!.name;
				if (name.startsWith('node:')) {
					sm.change(PrEvent.NoProtocolHeader);
				} else {
					sm.change(PrEvent.ProtocolHeader);
				}
				line = line.replace(moduleDeclaration, (m0, p1: string) => {
					const id = p1.replace('node:', '');
					let n = id;
					if (blacklist_modules.includes(id)) {
						n = `${blacklist_prefix}${id}`;
					} else {
						n = `node:${id}`;
					}
					return `declare module "${n}"`;
				});
			} else if (!hasIndent.test(line) && line.endsWith('{')) {
				sm.change(PrEvent.OpeningTag);
			}
		} catch (e) {
			logger.error('===========================');
			logger.error(fname);
			console.error(results.join('\n'));
			logger.error(`current line: ${line}`);
			throw e;
		}

		const state = sm.getName();
		if (state === PrState.ModuleNoProtocol) {
			noProtocol.push(line);
		} else if (state === PrState.ModuleWithProtocol) {
			hasProtocol.push(line);
		} else {
			results.push(line);
		}

		if (line === '}' || line === '};') {
			sm.change(PrEvent.ClosingTag);
		}
	}

	const win = noProtocol.length > hasProtocol.length ? noProtocol : hasProtocol;
	// const lose = noProtocol.length <= hasProtocol.length ? noProtocol : hasProtocol;
	results.push(...win);

	if (fname === 'process.d.ts') {
		const start = results.findIndex((line) => line.includes('interface BuiltInModule'));
		if (start === -1) throw new Error(`missing interface BuiltInModule in process.d.ts`);
		const end = results.findIndex((line) => line.trim() === '}', start);
		if (end === -1) throw new Error(`missing BuiltInModule ending in process.d.ts`);

		const lines = results.splice(start + 1, end - start - 1);
		results.splice(start + 1, 0, ...lines.filter((e) => e.includes('node:')));
	}

	output.append(replace_imports(fname, results).join('\n'));

	assert.equal(sm.getName(), PrState.Normal, `invalid ending state (protocol): ${fname}`);
}

const refPathReg = /^\/\/\/\s+<reference\s+path="(?<path>[^"]+)"/;
function stripIndex(_fname: string, input: string, output: FileBuilder) {
	for (const lines of input.split('\n')) {
		const match = refPathReg.exec(lines);
		if (match) {
			const refPath = match.groups!.path;
			const id = refPath.replace('.d.ts', '');
			if (blacklist_modules.includes(id)) {
				continue;
			}
		}
		output.append(lines);
	}
}

const importReplacer = new Map();
enum IrState {
	Normal = 'n',
	Comment = 'c',
	MultilineImport = 'mli',
}
enum IrEvent {
	FoundComment = 'fc',
	FoundCommentEnd = 'fce',
	FoundImportStart = 'fis',
	FoundImportEnd = 'fie',
}
importReplacer.set(
	IrState.Normal,
	new Map<IrEvent, IrState>([
		[IrEvent.FoundComment, IrState.Comment],
		[IrEvent.FoundImportStart, IrState.MultilineImport],
	]),
);
importReplacer.set(IrState.Comment, new Map<IrEvent, IrState>([[IrEvent.FoundCommentEnd, IrState.Normal]]));

importReplacer.set(IrState.MultilineImport, new Map<IrEvent, IrState>([[IrEvent.FoundImportEnd, IrState.Normal]]));

const staticImportRegex = /\s+from\s+['"](.+?)['"]/g;
const dynamicImportRegex = /(import|require)\(\s*['"](\S+?)['"]\s*\)/g;
function replace_imports(fname: string, text: string[]) {
	const sm = new SimpleStateMachine<IrState, IrEvent>(importReplacer, IrState.Normal);

	// if (fname === 'path.d.ts') debugger;
	const wrap = makeWrap(fname);

	let last_line = '';
	let last_change_line = '';
	sm.onStateChange((e) => {
		last_change_line = `state changed: ${e}: ${last_line}`;
	});

	const r = text.map((line, lno) => {
		last_line = `${lno}: ${line}`;
		// if (line.includes('typeof import("assert")')) debugger;
		const tline = line.trim();
		if (sm.getName() === IrState.Comment) {
			if (tline.includes('*/')) {
				sm.change(IrEvent.FoundCommentEnd);
			}
		} else if (sm.getName() === IrState.MultilineImport) {
			if (tline.includes(' from ')) {
				sm.change(IrEvent.FoundImportEnd);
				line = line.replace(staticImportRegex, (m0, p1) => {
					return ` from '${wrap(p1)}'`;
				});
			}
		} else {
			if (tline.startsWith('import ')) {
				if (tline.includes(' = ')) {
					line = line.replace(dynamicImportRegex, (m0, require, p1) => {
						return `${require}('${wrap(p1)}')`;
					});
				} else if (!tline.includes(' from ')) {
					sm.change(IrEvent.FoundImportStart);
				} else {
					line = line.replace(staticImportRegex, (m0, p1) => {
						return ` from '${wrap(p1)}'`;
					});
				}
			} else if (tline.startsWith('/*')) {
				if (!tline.endsWith('*/')) {
					sm.change(IrEvent.FoundComment);
				}
			} else {
				line = line.replace(dynamicImportRegex, (m0, require, p1) => {
					return `${require}('${wrap(p1)}')`;
				});
			}
		}

		return line;
	});

	assert.equal(sm.getName(), IrState.Normal, `invalid ending state (imports): ${fname} - ${last_change_line}`);

	return r;
}
function replace_undici_imports(fname: string, text: string) {
	const wrap = makeWrap(fname);
	return text
		.replace(staticImportRegex, (match: string, p1: string) => {
			// if (match.includes('node:dns')) debugger;
			if (!collectedNodeModules.has(p1) && !p1.startsWith('node:')) return match;
			return ` from '${wrap(p1)}'`;
		})
		.replace(dynamicImportRegex, (match: string, require: string, p1: string) => {
			if (!collectedNodeModules.has(p1)) return match;
			return `${require}('${wrap(p1)}')`;
		});
}
function makeWrap(fname: string) {
	const rootRel = '../'.repeat(fname.split('/').length - 1) || './';
	return function wrap(n: string) {
		let id = '';
		if (n === 'undici-types') {
			return `${rootRel}undici-types`;
		} else if (n.startsWith('node:')) {
			id = n.replace('node:', '');
		} else {
			id = n;
		}
		if (blacklist_modules.includes(id)) {
			return `${blacklist_prefix}${id}`;
		} else {
			return `node:${id}`;
		}
	};
}
