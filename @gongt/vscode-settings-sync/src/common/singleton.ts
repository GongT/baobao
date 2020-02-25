import { context, onExtensionActivate } from '@gongt/vscode-helpers';
import { CancellationToken, CancellationTokenSource, ProgressLocation, window } from 'vscode';
import { disposeButton } from './message.save';

let cancelSource: CancellationTokenSource | null;
let p: Promise<any> | null;

onExtensionActivate(() => {
	context.subscriptions.push({
		dispose() {
			if (cancelSource) {
				cancelSource.cancel();
				cancelSource.dispose();
			}
		},
	});
});

export function cancelCurrentSync() {
	if (cancelSource) {
		cancelSource.cancel();
		return true;
	} else {
		return false;
	}
}

export interface CancellationTokenWithPromise extends CancellationToken {
	p: Promise<never>;
	able<T>(promise: Promise<T>): Promise<T>;
}

export function interrupt<T>(cancel: CancellationTokenWithPromise, promise: Promise<T>): Promise<T> {
	return Promise.race([cancel.p, promise]);
}

export function runSyncWithProgressSingleton<T>(
	_cancelSource: CancellationTokenSource,
	fn: (cancel: CancellationTokenWithPromise) => Promise<T>
) {
	if (cancelSource) {
		throw new Error('Another sync process is running.');
	}

	disposeButton();
	cancelSource = _cancelSource || new CancellationTokenSource();
	const _token = cancelSource!.token;
	const token: CancellationTokenWithPromise = Object.assign(_token, {
		p: new Promise<never>((_, reject) => {
			_token.onCancellationRequested(() => reject(new Error('user cancel')));
		}),
		able<T>(p: Promise<T>): Promise<T> {
			return interrupt(token, p);
		},
	});
	p = Promise.resolve()
		.then(() =>
			window.withProgress(
				{
					location: ProgressLocation.Window,
					title: 'Sync settings...',
					cancellable: false,
				},
				() => {
					return fn(token);
				}
			)
		)
		.finally(() => {
			cancelSource!.dispose();
			cancelSource = null;
			p = null;
		});

	return p;
}
