import { inspect, InspectOptions } from 'util';
import ts from 'typescript';
import { createColor, createInspectTab, ILogger } from './logger';
import { IResolveResult } from './MapResolver';
import { idToString } from './tsapi.helpers';

import type { inspect as utilsInspect } from 'util';

export interface WithOriginal {
	id?: ts.Identifier;
}

export interface IResolveResultWithNode extends IResolveResult {
	node: ts.Node;
}

export interface IDefaultResult {
	node: ts.Node;
	id?: ts.Identifier;
	kind: ExportKind;
}

export interface IIdentifierResult {
	node: ts.Node;
	id: ts.Identifier;
	kind: ExportKind;
	reference?: IResolveResult & WithOriginal;
}

export enum ExportKind {
	Unknown,
	Variable,
	Function,
	Class,
	Type,
}

export interface ITypescriptFile {
	readonly sourceFile: ts.SourceFile;
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
		public readonly sourceFile: ts.SourceFile,
		public readonly relativePath: string,
		private readonly logger: ILogger
	) {
		this.absolutePath = sourceFile.fileName;
	}

	add(id: ts.Identifier, node: ts.Node, kind: ExportKind) {
		const name = idToString(id);
		if (this.identifiers.has(name)) this.logger.log('duplicate exported identifier: %s', idToString(id));

		this.identifiers.set(name, { node, id, kind });
	}

	addRef(id: ts.Identifier, node: ts.Node, reference: IResolveResult & WithOriginal, kind = ExportKind.Unknown) {
		const name = idToString(id);
		if (this.identifiers.has(name)) this.logger.log('duplicate exported identifier: %s', idToString(id));

		this.identifiers.set(name, { node, id, kind, reference });
	}

	addNamespaceRef(otherFile: IResolveResult, node: ts.Node) {
		this.references.push({
			...otherFile,
			node,
		});
	}

	setDefault(id: undefined | ts.Identifier, node: ts.Node, kind: ExportKind) {
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
			ret += tab + c.blue('identifiers') + `(${this.identifiers.size}):\n`;
			for (const [name, def] of this.identifiers.entries()) {
				ret += `${tab}  - ${c.green(name)}`;
				if (def.reference) {
					ret += ' (';
					if (def.kind !== ExportKind.Unknown) {
						ret += ExportKind[def.kind] + ' ';
					}
					ret += `from ${def.reference.relative}`;
					if (def.reference.id) {
						ret += `:${idToString(def.reference.id)}`;
					}
					ret += ')';
				} else {
					ret += ` (${ExportKind[def.kind]})`;
				}
				ret += '\n';
			}
		}

		if (this.references.length) {
			ret += tab + c.blue('references') + `(${this.references.length}):\n`;
			for (const e of this.references) {
				ret += tab + '  - ' + c.green(e.relative) + '\n';
			}
		}

		if (this._defaultExport) {
			ret += tab + c.red('default') + ': ';
			if (this._defaultExport.id) {
				ret += c.gay(idToString(this._defaultExport.id));
			} else {
				ret += c.gay('anonymouse');
			}
			ret += ` (${ExportKind[this._defaultExport.kind]})`;
		}
		return ret.trim() + '\n}';
	}
}
