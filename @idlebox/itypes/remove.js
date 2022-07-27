let walked = new WeakSet();
const parent = findParent(require.main);
walked = undefined;

if (!parent) {
	throw new Error('[@idlebox/itypes] Can not find who import this file.');
}
if (parent.id.includes('@rushstack/heft')) {
	module.exports = require('./remove-script/heft.js');
} else if (parent.id.includes('@build-script/builder')) {
	require('./remove-script/buildscript.js');
} else {
	throw new Error('[@idlebox/itypes] Can not detect builder type.');
}

function findParent(parent) {
	for (const child of parent.children) {
		if (walked.has(child)) {
			continue;
		}

		if (child === module) {
			return parent;
		}

		walked.add(child);

		const found = findParent(child);
		if (found) return found;
	}
}
