import { ExtensionContext } from 'vscode';
import { _setContext, context } from './context';
import { developmentFlushPackage } from './development';
import { logger, VSCodeChannelLogger } from './logger.ipc';
import { _setExtStat, ExtensionState } from './state';
import { storage } from './storage';

interface IActivateFunction {
	(context: ExtensionContext): Promise<any>;
}
interface IDeactivateFunction {
	(): void | Promise<void>;
}

const toBeActivate: IActivateFunction[] = [];

export function onExtensionActivate(fn: IActivateFunction) {
	toBeActivate.push(fn);
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
	return function extensionEntry(_context: ExtensionContext) {
		_setExtStat(ExtensionState.INIT);

		// detect env
		try {
			_setContext(_context);

			logger.setTitle(context.extensionName);
			logger.log('extension activating... [%s]', context.isDevelopment ? 'development' : 'production');
		} catch (e) {
			const el = new VSCodeChannelLogger('early load error');
			el.error('Failed init extension (%s).', _context.extensionPath);
			el.error(e);
			el.show();
		}

		storage.init(context);

		return Promise.resolve()
			.then(async () => {
				for (const fn of toBeActivate) {
					await fn(context);
				}
				toBeActivate.length = 0;
				Object.freeze(toBeActivate);
			})
			.then(() => {
				return activate(context);
			})
			.then(
				(data) => {
					logger.log('extension loaded...');
					_setExtStat(ExtensionState.NORMAL);

					if (context.isDevelopment) {
						developmentFlushPackage();
					}

					logger.emptyline();
					logger.emptyline();
					logger.emptyline();
					return data;
				},
				(e) => {
					logger.error('extension can not loaded!');
					logger.error(e ? e.stack || e.message || 'Unknown Error' : 'Empty Error');
					logger.show();
					_setExtStat(ExtensionState.EXIT);
					throw e;
				}
			);
	};
}
export function vscodeExtensionDeactivate(deactivate: IDeactivateFunction): IDeactivateFunction {
	return async function extensionDestruct() {
		_setExtStat(ExtensionState.DEINIT);
		logger.log('extension deactivating...');
		try {
			await deactivate();
			await logger.dispose();
		} catch (e) {
			logger.error('Error during deactivate...', e);
		}
		_setExtStat(ExtensionState.EXIT);
	};
}
