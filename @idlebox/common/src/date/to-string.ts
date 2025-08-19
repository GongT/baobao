import { pad2 } from '../string/pad2.js';
import { oneDay, oneHour, oneMinute, oneSecond } from './consts.js';

export namespace humanDate {
	/**
	 * Format: HH:mm:ss
	 */
	export function time(date: Date | string | number) {
		if (typeof date === 'string') {
			date = Number.parseInt(date);
		}
		date = new Date(date as number);
		return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
	}

	/**
	 * Format: YYYY-MM-dd
	 *
	 * separator can change
	 */
	export function date(date: Date | string | number, sp = '-') {
		if (typeof date === 'string') {
			date = Number.parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}${sp}${pad2(date.getMonth() + 1)}${sp}${pad2(date.getDate())}`;
	}

	/**
	 * Format: YYYY-MM-dd HH:mm:ss
	 */
	export function datetime(date: Date | string | number) {
		if (typeof date === 'string') {
			date = Number.parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
	}

	export type ITimeFormatter = (s: number) => string;

	export interface IFormatters {
		ms: ITimeFormatter;
		s: ITimeFormatter;
		m: ITimeFormatter;
		h: ITimeFormatter;
		d: ITimeFormatter;
	}

	const formatters: IFormatters = {
		ms(v: number) {
			return `${v}ms`;
		},
		s(v: number) {
			return `${v}s`;
		},
		m(v: number) {
			return `${v}m`;
		},
		h(v: number) {
			return `${v}h`;
		},
		d(v: number) {
			return `${v}d`;
		},
	};

	/**
	 * set format for time delta
	 */
	export function setLocaleFormatter(formatter: Partial<IFormatters>) {
		Object.assign(formatters, formatter);
	}

	/**
	 * format time delta (in ms) to string, like: '1d'
	 * when delta<=0, returns '0s'
	 *
	 * format can set by `setLocaleFormatter`
	 * day is the largest unit
	 */
	export function deltaTiny(from: number, to: number): string;
	export function deltaTiny(ms: number): string;
	export function deltaTiny(from: number, to?: number) {
		const delta = to !== undefined ? from - to : from;
		if (delta > oneDay) {
			return formatters.d(Math.floor(delta / oneDay));
		} else if (delta > oneHour) {
			return formatters.h(Math.floor(delta / oneHour));
		} else if (delta > oneMinute) {
			return formatters.m(Math.floor(delta / oneMinute));
		} else if (delta > oneSecond) {
			return formatters.s(Math.floor(delta / oneSecond));
		} else if (delta > 0) {
			return formatters.ms(Math.floor(delta));
		} else {
			return '0s';
		}
	}

	/**
	 * format time delta (in ms) to string, like: '1d10m42s'
	 * only return XXXms when delta<1min
	 * when delta<=0, returns '0s'
	 *
	 * format can set by `setLocaleFormatter`
	 * day is the largest unit
	 */
	export function delta(from: number, to: number): string;
	export function delta(deltaMs: number): string;
	export function delta(from: number, to?: number) {
		const delta = to !== undefined ? from - to : from;
		if (delta <= 0) {
			return '0s';
		}

		let ms = delta;
		let ret = '';
		if (ms > oneDay) {
			ret += formatters.d(Math.floor(ms / oneDay));
			ms = ms % oneDay;
		}
		if (ms > oneHour) {
			ret += formatters.h(Math.floor(ms / oneHour));
			ms = ms % oneHour;
		}
		if (ms > oneMinute) {
			ret += formatters.m(Math.floor(ms / oneMinute));
			ms = ms % oneMinute;
		}
		if (ms > oneSecond) {
			ret += formatters.s(Math.floor(ms / oneSecond));
			ms = ms % oneSecond;
		}
		if (ms > 0 && delta < oneMinute) {
			ret += formatters.ms(Math.floor(ms));
		}

		return ret;
	}
}
