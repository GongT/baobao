export function nextSecond(d: Date, n = 1) {
	d.setSeconds(d.getSeconds() + n);
	return d;
}
export function nextMinute(d: Date, n = 1) {
	d.setMinutes(d.getMinutes() + n);
	return d;
}
export function nextHour(d: Date, n = 1) {
	d.setHours(d.getHours() + n);
	return d;
}
export function nextDay(d: Date, n = 1) {
	d.setDate(d.getDate() + n);
	return d;
}
export function nextWeek(d: Date, n = 1) {
	d.setDate(d.getDate() + n * 7);
	return d;
}
export function nextMonth(d: Date, n = 1) {
	d.setMonth(d.getMonth() + n);
	return d;
}
export function nextYear(d: Date, n = 1) {
	d.setFullYear(d.getFullYear() + n);
	return d;
}
