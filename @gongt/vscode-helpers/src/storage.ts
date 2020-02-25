import { ExtensionContext, Memento } from 'vscode';

export class ExtensionStorage {
	declare readonly workspace: Memento;
	declare readonly global: Memento;
	private constructor() {}

	/** @internal */
	static create(): ExtensionStorage {
		return new ExtensionStorage();
	}
	/** @internal */
	init(context: ExtensionContext) {
		Object.defineProperty(this, 'global', {
			writable: false,
			configurable: false,
			value: context.globalState,
		});
		Object.defineProperty(this, 'workspace', {
			writable: false,
			configurable: false,
			value: context.workspaceState,
		});
	}
}
