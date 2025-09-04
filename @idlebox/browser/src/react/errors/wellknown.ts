import { NotError } from '@idlebox/common';

export class ComponentUnmounted extends NotError {
	constructor() {
		super('组件卸载');
	}
}
