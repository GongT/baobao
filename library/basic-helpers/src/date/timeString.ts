export namespace humanDate {
	export function time(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	}

	export function date(date: Date | string | number, sp = '-') {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}${sp}${date.getMonth() + 1}${sp}${date.getDate()}`;
	}

	export function datetime(date: Date | string | number) {
		if (typeof date === 'string') {
			date = parseInt(date);
		}
		date = new Date(date as number);
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
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
		s(v: number) {return v + 's';},
		m(v: number) {return v + 'm';},
		h(v: number) {return v + 'h';},
		d(v: number) {return v + 'd';},
	};

	export function setLocaleFormatter(formatter: Partial<IFormatters>) {
		Object.assign(formatters, formatter);
	}

	export function deltaTiny(ms: number) {
		if (ms > 86400000) {
			return formatters.d(ms / 86400000);
		}
		if (ms > 3600000) {
			return formatters.h(ms / 3600000);
		}
		if (ms > 60000) {
			return formatters.m(ms / 60000);
		}
		return formatters.s(Math.ceil(ms / 1000));
	}

	export function delta(ms: number) {
		let ret = '';
		let val = Math.ceil(ms / 1000);

		if (val === 0) {
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
