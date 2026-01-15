export function die(message: string): never {
	console.error(`====================================================`);
	console.error(`defects in "@idlebox/args"`);
	console.error(message);
	console.error(`====================================================`);
	process.exit(1);
}

export function assert(condition: boolean, message: string): asserts condition {
	if (!condition) die(message);
}
