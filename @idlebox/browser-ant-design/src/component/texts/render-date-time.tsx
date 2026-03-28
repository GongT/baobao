import { fromTimeStamp, humanDate } from '@idlebox/common';
import { Typography } from 'antd';

humanDate.setLocaleFormatter({
	ms(v: number) {
		return `${v}毫秒`;
	},
	s(v: number) {
		return `${v}秒`;
	},
	m(v: number) {
		return `${v}分`;
	},
	h(v: number) {
		return `${v}小时`;
	},
	d(v: number) {
		return `${v}天`;
	},
});

export function renderTimestamp(ts: number) {
	const date = fromTimeStamp(ts);
	return <Typography.Text title={humanDate.datetime(date)}>{humanDate.deltaTiny(Date.now(), date.getTime())}前</Typography.Text>;
}

export function renderDate(mdate: Date | number | string) {
	let date: Date;
	if (mdate instanceof Date) {
		date = mdate;
	} else {
		date = new Date(mdate);
	}
	if (Number.isNaN(date.getTime())) {
		return <Typography.Text title={`${mdate}`}>数据无效</Typography.Text>;
	}
	return <Typography.Text title={humanDate.datetime(date)}>{humanDate.deltaTiny(Date.now(), date.getTime())}前</Typography.Text>;
}
