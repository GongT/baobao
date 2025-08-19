const inspect = Symbol.for('nodejs.util.inspect.custom'); // high version node
const inspectOld = tryGetSymbol();

declare const global: any;

function tryGetSymbol() {
	try {
		const r = global.require;
		return r('util').inspect.custom;
	} catch {
		return undefined;
	}
}

/**
 * try to call `inspect` method of an object, if not exists, call `toString`.
 * @returns {string}
 */
export function tryInspect(object: any): string {
	if (!object || typeof object !== 'object') {
		return JSON.stringify(object);
	}

	if (object[inspect]) {
		return object[inspect]();
	}
	if (inspectOld && object[inspectOld]) {
		return object[inspectOld]();
	}
	if (object.inspect) {
		return object.inspect();
	}
	if (object[Symbol.toStringTag]) {
		return object[Symbol.toStringTag]();
	}
	if (object.toJSON) {
		return object.toJSON();
	}
	if (object.constructor?.name) {
		return `unknown: ${object.constructor.name}`;
	}
	return `unknown: ${object}`;
}
