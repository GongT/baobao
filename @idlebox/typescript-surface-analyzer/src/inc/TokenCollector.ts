import type TypeScriptApi from 'typescript';
import { inspect, type InspectOptions } from 'node:util';
import { createColor, createInspectTab, type ILogger } from './logger.js';
import type { IResolveResult } from './MapResolver.js';
import { ApiHost } from './tsapi.helpers.js';

import type { inspect as utilsInspect } from 'node:util';

export interface WithOriginal {
	id?: TypeScriptApi.ModuleExportName;
}

export interface IResolveResultWithNode {
	node: TypeScriptApi.Node;
	reference: IResolveResult;
}

export interface IDefaultResult {
	node: TypeScriptApi.Node;
	id?: TypeScriptApi.Identifier;
	kind: ExportKind;
}

export interface IIdentifierResult {
	node: TypeScriptApi.Node;
	id: TypeScriptApi.ModuleExportName;
	kind: ExportKind;
	reference?: IResolveResult & WithOriginal;
}

export enum ExportKind {
	Unknown = 0,
	Variable = 1,
	Function = 2,
	Class = 3,
	Type = 4,
}

export interface ITypescriptFile {
	readonly sourceFile: TypeScriptApi.SourceFile;
	readonly relativePath: string;
	readonly absolutePath: string;

	readonly identifiers: Map<string, IIdentifierResult>;
	readonly references: IResolveResultWithNode[];
	readonly defaultExport?: IDefaultResult;
}

export class TokenCollector implements ITypescriptFile {
	public readonly identifiers = new Map<string, IIdentifierResult>();
	public readonly references: IResolveResultWithNode[] = [];
	private _defaultExport?: IDefaultResult;

	public readonly absolutePath: string;
	constructor(
		public readonly sourceFile: TypeScriptApi.SourceFile,
		public readonly relativePath: string,
		private readonly logger: ILogger
	) {
		this.absolutePath = sourceFile.fileName;
	}

	add(id: TypeScriptApi.Identifier, node: TypeScriptApi.Node, kind: ExportKind) {
		const name = ApiHost.idToString(id);
		if (this.identifiers.has(name)) this.logger.debug('duplicate exported identifier: %s', ApiHost.idToString(id));

		this.identifiers.set(name, { node, id, kind });
	}

	addRef(
		id: TypeScriptApi.ModuleExportName,
		node: TypeScriptApi.Node,
		reference: IResolveResult & WithOriginal,
		kind = ExportKind.Unknown
	) {
		const name = ApiHost.idToString(id);
		if (this.identifiers.has(name)) this.logger.debug('duplicate exported identifier: %s', ApiHost.idToString(id));

		this.identifiers.set(name, { node, id, kind, reference });
	}

	addNamespaceRef(otherFile: IResolveResult, node: TypeScriptApi.Node) {
		this.references.push({
			reference: otherFile,
			node,
		});
	}

	setDefault(id: undefined | TypeScriptApi.Identifier, node: TypeScriptApi.Node, kind: ExportKind) {
		if (this._defaultExport) this.logger.error('duplicate exported identifier: default');
		this._defaultExport = { id, node, kind };
	}

	get defaultExport() {
		return this._defaultExport;
	}

	[inspect.custom](depth: number, inspectOptions: InspectOptions, _inspect: typeof utilsInspect) {
		const tab = createInspectTab(depth, inspectOptions);
		const c = createColor(inspectOptions);

		let ret = `ITypescriptFile< ${c.blue(this.relativePath)} > {\n`;

		if (this.identifiers.size > 0) {
			ret += `${tab + c.blue('identifiers')}(${this.identifiers.size}):\n`;
			for (const [name, def] of this.identifiers.entries()) {
				ret += `${tab}  - ${c.green(name)}`;
				if (def.reference) {
					ret += ' (';
					if (def.kind !== ExportKind.Unknown) {
						ret += `${ExportKind[def.kind]} `;
					}
					ret += `from ${def.reference.type === 'file' ? def.reference.relative : def.reference.name}`;
					if (def.reference.id) {
						ret += `:${ApiHost.idToString(def.reference.id)}`;
					}
					ret += ')';
				} else {
					ret += ` (${ExportKind[def.kind]})`;
				}
				ret += '\n';
			}
		}

		if (this.references.length) {
			ret += `${tab + c.blue('references')}(${this.references.length}):\n`;
			for (const { reference } of this.references) {
				ret += `${tab}  - ${c.green(reference.type === 'file' ? reference.relative : reference.name)}\n`;
			}
		}

		if (this._defaultExport) {
			ret += `${tab + c.red('default')}: `;
			if (this._defaultExport.id) {
				ret += c.gay(ApiHost.idToString(this._defaultExport.id));
			} else {
				ret += c.gay('anonymouse');
			}
			ret += ` (${ExportKind[this._defaultExport.kind]})`;
		}
		return `${ret.trim()}\n}`;
	}
}
