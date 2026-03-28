import { convertCaughtError } from '@idlebox/common';
import { createContext, useContext, type ReactNode } from 'react';

interface INotifyInternal {
	readonly controller: INotifyController;
}

const context = createContext<INotifyInternal>(
	undefined as any,
	// new Proxy({} as INotifyInternal, {
	// 	get() {
	// 		throw new Error('缺少 NotifyProvider 上下文');
	// 	},
	// }),
);

export enum NotifyLevel {
	Info,
	Success,
	Error,
}

export interface INotificationOptions extends IOptions {
	title?: string;
	level: NotifyLevel;
	content: ReactNode;
}

type IOptionsBase = {};

interface IOptions extends IOptionsBase {
	/**
	 * 秒
	 * level=info时，设为null不消失
	 */
	duration?: number | null;
	id?: string | number;
	/**
	 * 因任何原因关闭时触发
	 */
	onFinish?(): void;

	// onAction?(id: string): void;
}

export interface INotifyController {
	error(e: unknown, title?: string, options?: IOptionsBase): void;
	success(message: string, title?: string, options?: IOptions): void;
	info(message: string, title?: string, options?: IOptions): void;

	/**
	 * 执行异步函数，成功或失败后都会有通知
	 *
	 * 不建议在此之后继续执行代码，哪怕成功（也就是应该把逻辑全都包裹在fn里面）
	 *
	 * **不会reject**
	 *
	 * @param asyncFunc 异步函数
	 * @returns 异步函数的返回值，一旦出错会返回undefined
	 */
	execute<T>(title: string, fn: () => Promise<T>): Promise<T | undefined>;

	/**
	 * 执行异步函数，只有失败后都会有通知
	 */
	executeSilent<T>(title: string, fn: () => Promise<T>): Promise<T>;
}

export function useNotify() {
	return useContext(context).controller;
}

interface INotifyProviderProps {
	open(options: INotificationOptions): void;
	children: ReactNode;
}

export function NotifyProvider({ open, children }: INotifyProviderProps) {
	const controller: INotifyController = {
		error(e: unknown, title: string = '操作失败') {
			const message = typeof e === 'string' ? e : convertCaughtError(e).message;
			return open({ title, level: NotifyLevel.Error, content: message });
		},
		success(message: string, title: string = '操作成功') {
			return open({ title, level: NotifyLevel.Success, content: message });
		},
		info(message: string, title?: string) {
			return open({ title, level: NotifyLevel.Info, content: message });
		},
		async execute(title: string, fn: () => Promise<any>) {
			try {
				const result = await fn();
				this.success(`操作成功: ${title}`);
				return result;
			} catch (e) {
				this.error(e, `操作失败: ${title}`);
				return undefined;
			}
		},
		async executeSilent(title: string, fn: () => Promise<any>) {
			try {
				return await fn();
			} catch (e) {
				this.error(e, `操作失败: ${title}`);
				return undefined;
			}
		},
	};
	return <context.Provider value={{ controller }}>{children}</context.Provider>;
}
