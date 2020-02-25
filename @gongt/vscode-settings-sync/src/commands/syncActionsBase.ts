import { Action, extStor, logger } from '@gongt/vscode-helpers';
import { CanceledError, isCanceledError } from '@idlebox/lifecycle';
import { window } from 'vscode';

import { applyCurrentConfig } from '../common/applyCurrentConfig';
import { disposeButton } from '../common/message.save';
import { CancellationTokenWithPromise, runSyncWithProgressSingleton } from '../common/singleton';
import { createState, MyState } from '../common/state';
import { STORE_ID_CURRENT_VERSION } from '../constants';

export const myExtension = Symbol('@gongt/call-by-self');

export abstract class SyncActionBase<T extends any[] = []> extends Action<boolean> {
	private _isAuto: boolean = false;

	protected get isAuto() {
		return this._isAuto;
	}

	run(callBy?: symbol, ...args: T) {
		this._isAuto = callBy === myExtension;

		return runSyncWithProgressSingleton<boolean>(this.cancelSource, async (cancel) => {
			try {
				logger.info('[SyncActionBase] prepare...');
				const state = await cancel.able(createState());
				const changed = await this._run(cancel, state, ...args);
				logger.debug(' :: _run return ->', changed);

				if (changed) {
					await applyCurrentConfig();
					await state.git('push', '--force');
					const currentId = await state.git('rev-parse', 'master');
					logger.info('current rev id =', currentId);
					extStor.global.update(STORE_ID_CURRENT_VERSION, currentId);
				}

				if (!changed) window.setStatusBarMessage('$(check) Setting has no change.', 2000);
				disposeButton();
				return changed;
			} catch (e) {
				if (isCanceledError(e)) {
					logger.debug('interrupt by my self.');

					if (this._isAuto) {
						throw e;
					} else {
						// user request, return any to prevent vscode show error
						return undefined as any;
					}
				} else {
					logger.error(e);

					if (this._isAuto) {
						/*setButton({
							text: '$(debug)',
							command: wrapId(IdCategory.Action, ShowLogWindowAction.id),
							tooltip: 'Something wrong when sync settings, click to show log',
						});*/
						throw new CanceledError();
					} else {
						throw e;
					}
				}
			}
		}).finally(() => {
			logger.info('[SyncActionBase] Done...');
			logger.emptyline();
			logger.emptyline();
			logger.emptyline();
		});
	}

	protected abstract _run(cancel: CancellationTokenWithPromise, state: MyState, ...args: T): Promise<boolean>;
}
