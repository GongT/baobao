import { CanceledError } from '@idlebox/common';
import { CancellationTokenSource, commands } from 'vscode';
import { context, IdCategory, wrapId } from './context';
import { upgradePackageContributeAction } from './development';
import { logger } from './main';
import { ICommandIcon } from './packagejson';
import { extensionState, ExtensionState } from './state';

export interface IAction<T = void> {
	run(...args: any[]): Promise<T> | T;
	dispose(): void;
}

export interface IActionConstructor<T = void> {
	readonly id: string;
	readonly label: string;

	readonly icon?: ICommandIcon;
	readonly category?: string;

	new (): IAction<T>;
}

export function registerAction<T>(actionCtor: IActionConstructor<T>, exposed: boolean = false) {
	if (extensionState !== ExtensionState.INIT && extensionState !== ExtensionState.NORMAL) {
		throw new Error(`Cannot register action in this state (${ExtensionState[extensionState]})`);
	}

	context.subscriptions.push(
		commands.registerCommand(wrapId(IdCategory.Action, actionCtor.id), runExtensionAction, actionCtor)
	);

	if (exposed && context.isDevelopment) {
		upgradePackageContributeAction(actionCtor);
	}
}

export async function runMyAction<T>(Act: IActionConstructor<T>, args: any[] = []): Promise<T> {
	logger.debug('# + command %s', Act.id);
	const action = new Act();
	const ret = await action.run(...args);
	action.dispose();
	logger.debug('# - command %s', Act.id);
	return ret;
}

async function runExtensionAction(this: IActionConstructor, ...args: any[]) {
	await runMyAction(this, args);
}

export abstract class Action<T> implements IAction<T> {
	protected readonly cancelSource = new CancellationTokenSource();
	protected readonly cancel = this.cancelSource.token;

	constructor() {}

	protected selfCancel() {
		this.cancelSource.cancel();
		throw new CanceledError();
	}

	dispose() {
		this.cancelSource.cancel();
		this.cancelSource.dispose();
	}

	abstract run(...args: any[]): Promise<T>;
}

export abstract class SingleInstanceAction<T> extends Action<T> {
	private declare static lastRun: Promise<any>;

	async run(...args: any[]): Promise<T> {
		const self: any = this.constructor;
		if (self.lastRun) {
			return await self.lastRun;
		} else {
			return this._run(...args).finally(() => {
				delete self.lastRun;
			});
		}
	}

	static wait() {
		return this.lastRun;
	}

	abstract _run(...args: any[]): Promise<T>;
}
