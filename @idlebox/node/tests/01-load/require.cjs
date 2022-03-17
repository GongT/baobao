try {
	const r = require('@idlebox/node');
	console.log('exports has %s elements', Object.keys(r).length);
} catch (e) {
	console.error(e.message);
	process.exit(1);
}
