import { camelCase, ucfirst } from '@idlebox/helpers';
import { ExtensionContext, extensions } from 'vscode';
import { IPackageJson } from './packagejson';

let _context: any;
let _extend: any /* MyExtend */;

export interface MyExtend {
	isDevelopment: boolean;
	extensionName: {
		id: string;
		display: string;
	};
}

/** @internal */
export function _setContext(__context: ExtensionContext) {
	_context = __context;
	const found = extensions.all.find((item) => item.extensionPath === __context.extensionPath);
	if (found) {
		pkgJsonCache = found.packageJSON;
	} else {
		console.error('Cannot find extension self in extensions.all');
		pkgJsonCache = require(_context.asAbsolutePath('package.json'));
	}
	_extend = {
		extensionName: getExtensionName(),
		isDevelopment: detectDevelopment(_context),
	};
}

export const context: ExtensionContext & MyExtend = new Proxy(
	{},
	{
		get(_: any, p: PropertyKey) {
			return _extend[p] || _context[p];
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
		set() {
			throw new Error('cannot set() on context');
		},
		deleteProperty() {
			throw new Error('cannot deleteProperty() on context');
		},
		defineProperty() {
			throw new Error('cannot defineProperty() on context');
		},
		getPrototypeOf() {
			return null;
		},
		setPrototypeOf() {
			return false;
		},
		isExtensible() {
			return false;
		},
		preventExtensions() {
			return false;
		},
	}
);

let pkgJsonCache: any;
export function getPackageJson(): IPackageJson {
	return pkgJsonCache;
}

export enum IdCategory {
	Action = 'action',
	Setting = 'setting',
}
export function wrapId(category: IdCategory, short: string) {
	return `${pkgJsonCache.publisher.toLowerCase()}-${pkgJsonCache.name}.${category}.${short}`;
}

function detectDevelopment(context: ExtensionContext) {
	const extensionPackage = getPackageJson().name;
	const isDevelopment = context.extensionPath.endsWith(extensionPackage);
	return isDevelopment;
}

function getExtensionName() {
	let id: string = getPackageJson().name;
	const name = ucfirst(camelCase(id.split('/').pop()!)).replace(/vscode/i, '');
	return {
		id,
		display: name,
	};
}
