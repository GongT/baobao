exports.init = function init_env() {
	Object.defineProperty(global, 'PROJECT_ROOT', {
		value: process.cwd(),
		writable: false,
		configurable: false,
		enumerable: true,
	});
	
	Object.defineProperty(global, 'SELF_ROOT', {
		value: require('path').dirname(__dirname),
		writable: false,
		configurable: false,
		enumerable: true,
	});
};

exports.load = function load(file) {
	exports.init();
	
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
