import { pad2 } from '../string/pad2';

export namespace humanDate {
	/**
	 * Format: HH:mm:ss
	 */
	export function time(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
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
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}${sp}${pad2(date.getMonth() + 1)}${sp}${pad2(date.getDate())}`;
	}

	/**
	 * Format: YYYY-MM-dd HH:mm:ss
	 */
	export function datetime(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return (
			`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` +
			' ' +
			`${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
		);
	}

	export interface ITimeFormatter {
		(s: number): string;
	}

	export interface IFormatters {
		s: ITimeFormatter;
		m: ITimeFormatter;
		h: ITimeFormatter;
		d: ITimeFormatter;
	}

	const formatters: IFormatters = {
		s(v: number) {
			return v + 's';
		},
		m(v: number) {
			return v + 'm';
		},
		h(v: number) {
			return v + 'h';
		},
		d(v: number) {
			return v + 'd';
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
	 * when ms<=0, returns '0s'
	 *
	 * format can set by `setLocaleFormatter`
	 * day is the largest unit
	 */
	export function deltaTiny(ms: number) {
		if (ms <= 0) {
			return '0s';
		}
		if (ms > 86400000) {
			return formatters.d(Math.floor(ms / 86400000));
		}
		if (ms > 3600000) {
			return formatters.h(Math.floor(ms / 3600000));
		}
		if (ms > 60000) {
			return formatters.m(Math.floor(ms / 60000));
		}
		return formatters.s(Math.floor(ms / 1000));
	}

	/**
	 * format time delta (in ms) to string, like: '1d10m42s'
	 * when ms<=0, returns '0s'
	 *
	 * format can set by `setLocaleFormatter`
	 * day is the largest unit
	 */
	export function delta(ms: number) {
		let ret = '';
		let val = Math.ceil(ms / 1000);

		if (val <= 0) {
			return '0s';
		}

		// sec
		const s = val % 60;
		val = Math.floor(val / 60);
		if (s > 0) {
			ret = formatters.s(s);
		}
		if (val === 0) {
			return ret;
		}

		// min
		const m = val % 60;
		val = Math.floor(val / 60);
		if (m > 0) {
			ret = formatters.m(m) + ret;
		}
		if (val === 0) {
			return ret;
		}

		// hour
		const h = val % 24;
		val = Math.floor(val / 24);
		if (h > 0) {
			ret = formatters.h(h) + ret;
		}
		if (val === 0) {
			return ret;
		}

		// day
		if (val > 0) {
			ret = formatters.d(h) + ret;
		}
		return ret;
	}
}
