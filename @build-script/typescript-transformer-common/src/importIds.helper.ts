import ts from 'typescript';
import { dumpNode } from './dumpNode';
import { ValidImportDeclaration } from './types';
import { nameToString } from './util';

interface IRegistryData {
	node: ValidImportDeclaration;
	identifier: ts.Identifier;
	stringifyName: string;
}

/** @internal */
export class ImportIdentifierCollection {
	private _length = 0;
	private idRegistry = new Map<ts.Identifier, IRegistryData>();
	private unusedIds = new Set<ts.Identifier>();

	constructor(private readonly checker: ts.TypeChecker) {}

	get length() {
		return this._length;
	}

	add(node: ValidImportDeclaration) {
		if (this._addNamespaceImport(node)) {
			return;
		}
		this._addNamedImport(node);
		this._addDefaultImport(node);
	}

	/** import def from */
	private _addDefaultImport(node: ValidImportDeclaration) {
		const name = node.importClause?.name;
		if (!name) {
			return false;
		}

		this.pushItem(node, name, 'default');
		return true;
	}

	/** import {a as b, c} from */
	private _addNamedImport(node: ValidImportDeclaration) {
		if (!node.importClause?.namedBindings || !ts.isNamedImports(node.importClause.namedBindings)) {
			return false;
		}
		const namedBindings = node.importClause.namedBindings;
		for (const item of namedBindings.elements) {
			this.pushItem(node, item.name, nameToString(item.propertyName || item.name));
		}
		return true;
	}

	/** import * as all from  */
	private _addNamespaceImport(node: ValidImportDeclaration) {
		if (!node.importClause?.namedBindings || !ts.isNamespaceImport(node.importClause.namedBindings)) {
			return false;
		}
		const namedBindings = node.importClause.namedBindings;
		this.pushItem(node, namedBindings.name, '*');
		return true;
	}

	private pushItem(node: ValidImportDeclaration, identifier: ts.Identifier, stringifyName: string) {
		const symbol = this.checker.getSymbolAtLocation(identifier);
		if (symbol) {
			this._length++;

			// printMyDiagnostic(node, '%s imported as %s', stringifyName, identifier.getText());
			this.idRegistry.set(identifier, { node, identifier, stringifyName });
			this.unusedIds.add(identifier);
		} else {
			// printMyDiagnostic(node, 'imported identifier "%s" has no symbol', node.getText());
		}
	}

	public findDeclaration(decl: ts.Declaration): ts.Identifier | undefined {
		let ret: ts.Identifier | undefined;
		const checkSame = (id?: ts.Identifier) => {
			if (id && this.unusedIds.has(id)) {
				return id;
			}
			return undefined;
		};
		if (ts.isImportSpecifier(decl)) {
			// import {a} || import { a as b }
			return checkSame(decl.name);
		} else if (ts.isNamespaceImport(decl)) {
			// import * as a
			return checkSame(decl.name);
		} else if (ts.isImportClause(decl)) {
			// import def
			return checkSame(decl.name);
		}
		return ret;
	}

	public found(id: ts.Identifier): IRegistryData {
		const info = this.idRegistry.get(id);
		if (!info) {
			dumpNode([...this.idRegistry.keys(), id]);
			throw new Error('program error.');
		}
		// console.log('!!!! %s (%s) used, is a value', info.stringifyName, info.node.getText());
		this.unusedIds.delete(id);
		return info;
	}

	public listNotFound(): IRegistryData[] {
		const ret: IRegistryData[] = [];
		for (const id of this.unusedIds.values()) {
			ret.push(this.idRegistry.get(id)!);
		}
		return ret;
	}
}
