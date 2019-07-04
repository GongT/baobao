import { pad2 } from './pad2';

export interface DateFunction {
	(date: Date): string;
}

let _dateFn: DateFunction = function defaultDateFunction(date: Date) {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};
let _timeFn: DateFunction = function defaultDateFunction(date: Date) {
	return `${date.getHours()}-${pad2(date.getMinutes())}-${pad2(date.getSeconds())}`;
};

export function registerLocaleDateString(timeFn: DateFunction, dateFn: DateFunction) {
	_timeFn = timeFn;
	_dateFn = dateFn;
}

export function datetimeHuman(d: Date) {
	return _dateFn(d) + ' ' + _timeFn(d);
}

export function dateHuman(d: Date) {
	return _dateFn(d);
}

export function timeHuman(d: Date) {
	return _timeFn(d);
}
