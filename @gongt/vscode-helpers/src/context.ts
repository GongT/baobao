import { camelCase, ucfirst } from '@idlebox/common';
import { ExtensionContext, extensions, window } from 'vscode';
import { IPackageJson } from './packagejson';

let _context: any;
let _extend: MyExtend;

let pkgJsonCache: IPackageJson;

export interface MyExtend {
	isDevelopment: boolean;
	extensionName: string;
	extensionId: string;
}

/** @internal */
export function _setContext(__context: ExtensionContext) {
	_context = __context;
	const found = extensions.all.find((item) => item.extensionPath === __context.extensionPath);
	let extensionId = '';
	if (found) {
		extensionId = found.id;
		pkgJsonCache = found.packageJSON;
	} else {
		window.showErrorMessage(`annot find self () in extensions.all, that's wired.`);
		pkgJsonCache = require(_context.asAbsolutePath('package.json'));
		extensionId = pkgJsonCache.publisher.toLowerCase() + '.' + pkgJsonCache.name;
	}

	const name = ucfirst(camelCase(pkgJsonCache.name.split('/').pop()!)).replace(/vscode/i, '');

	_extend = {
		extensionName: name,
		isDevelopment: detectDevelopment(_context),
		extensionId,
	};
}

export const context: ExtensionContext & MyExtend = new Proxy(
	{},
	{
		get(_: any, p: PropertyKey) {
			return _extend.hasOwnProperty(p) ? (_extend as any)[p] : _context[p];
		},
		getOwnPropertyDescriptor(_: any, p: PropertyKey) {
			return Object.getOwnPropertyDescriptor(_extend, p) || Object.getOwnPropertyDescriptor(_context, p);
		},
		has(_: any, p: PropertyKey) {
			return _extend.hasOwnProperty(p) || _context.hasOwnProperty(p);
		},
		enumerate() {
			return Object.keys(_context).concat(Object.keys(_extend));
		},
		ownKeys() {
			return Object.keys(_context).concat(Object.keys(_extend));
		},
		set(_: any, k: any, v: any) {
			throw (_context[k] = v);
		},
		deleteProperty() {
			throw new Error('cannot deleteProperty() on context');
		},
		defineProperty() {
			throw new Error('cannot defineProperty() on context');
		},
		getPrototypeOf() {
			return Object.getPrototypeOf(_context);
		},
		setPrototypeOf(_: any, v: any) {
			return Object.setPrototypeOf(_context, v);
		},
		isExtensible() {
			return Object.isExtensible(_context);
		},
		preventExtensions() {
			return Object.preventExtensions(_context);
		},
	}
);

export function getPackageJson(): IPackageJson {
	return pkgJsonCache;
}

export enum IdCategory {
	Action = 'action',
	Setting = 'setting',
}
export function wrapId(category: IdCategory, short: string) {
	return `${_extend.extensionId}.${category}.${short}`;
}

function detectDevelopment(context: ExtensionContext) {
	const extensionPackage = getPackageJson().name;
	const isDevelopment = context.extensionPath.endsWith(extensionPackage);
	return isDevelopment;
}
