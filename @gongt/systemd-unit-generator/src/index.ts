import { ISystemdUnit, IUnknownSection } from './types/index';

export type * from './types/index';

class SystemdUnit implements ISystemdUnit {
	declare Unit: any;

	toString() {
		return serialize(this);
	}

	toJSON() {
		return this;
	}
}

export function createSystemdUnit<T = ISystemdUnit & IUnknownSection>(): T {
	const obj = new SystemdUnit();

	return new Proxy<any>(obj, {
		get(target, prop, receiver) {
			if (typeof prop !== 'string') return undefined;

			if (!Reflect.has(target, prop)) {
				Reflect.set(target, prop, {});
			}
			return Reflect.get(target, prop, receiver);
		},
	});
}

export function serialize(obj: ISystemdUnit) {
	let ret = '';
	for (const [sect, data] of Object.entries(obj)) {
		const entries = [...Object.entries(data)];

		if (entries.length === 0) continue;

		ret += `[${sect}]\n`;

		for (const [field, value] of entries) {
			if (Array.isArray(value)) {
				for (const v of value) {
					ret += `${field}=${v}\n`;
				}
			} else {
				ret += `${field}=${value}\n`;
			}
		}

		ret += '\n';
	}
	return ret;
}
