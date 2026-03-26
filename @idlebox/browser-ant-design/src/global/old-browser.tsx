import { browserlistSupport } from '@idlebox/browser';
import { Alert } from 'antd';
import { useEffect, useState } from 'react';

export function AlertOldBrowser() {
	const [support, setSupport] = useState(true);

	useEffect(() => {
		setSupport(browserlistSupport.test(navigator.userAgent));
	}, []);

	if (support) return null;

	return (
		<Alert
			message="你所使用的浏览器版本较低，可能会导致部分功能无法使用。建议升级到最新版本的 Chrome、Edge 或 Firefox 浏览器。"
			type="warning"
			showIcon
			closable
			style={{ textAlign: 'center' }}
		/>
	);
}
