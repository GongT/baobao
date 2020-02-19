import { ExtensionContext } from 'vscode';
import { VSCodeChannelLogger, ignoreSymbol } from './logger';
import { camelCase, ucfirst } from '@idlebox/helpers';

export let logger: VSCodeChannelLogger = new VSCodeChannelLogger(ignoreSymbol);

interface IActivateFunction {
	(context: ExtensionContext): void;
}
interface IDeactivateFunction {
	(): void;
}

export function vscodeExtensionActivate(activate: IActivateFunction): IActivateFunction {
	if (!global.hasOwnProperty('vscode')) {
		Object.defineProperty(global, 'vscode', {
			writable: false,
			configurable: true,
			enumerable: false,
			value: require('vscode'),
		});
	}
	return function extensionEntry(context: ExtensionContext) {
		const n = require(context.asAbsolutePath('package.json')).name;
		const name = ucfirst(camelCase(n.split('/').pop())).replace(/vscode/i, '');
		logger.setTitle(name);
		logger.log('extension loaded.');
		activate(context);
	};
}
export function vscodeExtensionDeactivate(deactivate: IDeactivateFunction): IDeactivateFunction {
	return function extensionDestruct() {
		deactivate();
		logger.destroy();
	};
}
