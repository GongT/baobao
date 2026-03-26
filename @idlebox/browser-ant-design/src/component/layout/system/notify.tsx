import { NotifyLevel, NotifyProvider, type INotificationOptions } from '@idlebox/browser-react';
import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification/index.js';
import type { PropsWithChildren } from 'react';

type NotReadonly<T> = { -readonly [P in keyof T]: T[P] };

let gid = 0;
export function AntdNotifyProvider(props: Required<PropsWithChildren>) {
	const [api, contextHolder] = notification.useNotification();

	function handleOpen(options: INotificationOptions) {
		if (import.meta.env.DEV && options.duration && options.duration > 1000) {
			console.warn('Notification时长过长，单位是秒:', options.duration);
		}

		const args: NotReadonly<ArgsProps> = {
			key: options.id ?? ++gid,
			title: options.title ? options.title : options.content,
			description: options.title ? options.content : undefined,
			onClose: options.onFinish,
			showProgress: true,
			closable: true,
			placement: 'topRight',
		};

		switch (options.level) {
			case NotifyLevel.Error:
				args.type = 'error';
				args.duration = options.duration ?? 10;
				args.pauseOnHover = true;
				break;
			case NotifyLevel.Info:
				args.type = 'info';
				if (options.duration !== null) {
					args.duration = options.duration ?? 4;
				}
				break;
			case NotifyLevel.Success:
				args.type = 'success';
				args.duration = options.duration ?? 1;
				break;
			default:
				throw new Error(`未知的Notification级别: ${options.level}`);
		}

		api.open(args);
	}

	return (
		<>
			{contextHolder}
			<NotifyProvider {...props} open={handleOpen} />
		</>
	);
}
