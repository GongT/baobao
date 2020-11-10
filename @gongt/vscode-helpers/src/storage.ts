import { ExtensionContext, Memento } from 'vscode';

class ExtensionStorage {
	declare readonly workspace: Memento;
	declare readonly global: Memento;

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

export const storage: ExtensionStorage = new ExtensionStorage();
