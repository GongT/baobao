import { OSC, ST } from '../constants/sequence.js';

export function clear() {
	process.stderr.write(`${OSC}9;4;0;0${ST}`);
}
export function update(percent: number) {
	process.stderr.write(`${OSC}9;4;1;${percent.toFixed(0)}${ST}`);
}
export function indeterminate() {
	process.stderr.write(`${OSC}9;4;3${ST}`);
}
export function error(percent: number = 0) {
	process.stderr.write(`${OSC}9;4;2;${percent.toFixed(0)}${ST}`);
}
export function warning(percent: number = 0) {
	process.stderr.write(`${OSC}9;4;4;${percent.toFixed(0)}${ST}`);
}
export const dispose = clear;
