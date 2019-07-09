exports.load = function load(file) {
	Promise.resolve().then(() => {
		return require(file).default();
	}).catch((e) => {
		const stack = e.stack.split(/\n/);
		if (stack.length > 3) {
			stack.pop(); // root file
			stack.pop(); // function main()
		}
		if (process.stderr.isTTY) {
			console.error('\x1B[38;5;9m%s\x1B[0m', stack.join('\n'));
		} else {
			console.error(stack.join('\n'));
		}
		process.exit(e.code || 1);
	});
};
