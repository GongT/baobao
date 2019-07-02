const inspect = Symbol.for('nodejs.util.inspect.custom'); // high version node
const inspectOld = tryGetSymbol();

declare const require: any;

function tryGetSymbol() {
	try {
		return require('util').inspect.custom;
	} catch {
		return undefined;
	}
}

export function tryInspect(object: any) {
	if (!object || typeof object !== 'object') {
		return JSON.stringify(object);
	}

	if (object[inspect]) {
		return object[inspect]();
	} else if (inspectOld && object[inspectOld]) {
		return object[inspectOld]();
	} else if (object['inspect']) {
		return object['inspect']();
	} else if (object[Symbol.toStringTag]) {
		return object[Symbol.toStringTag]();
	} else if (object.toJSON) {
		return object.toJSON();
	} else {
		return '' + object;
	}
}
