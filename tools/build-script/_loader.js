const fancyLog = require('fancy-log');

const exit = process.exit;
process.exit = () => {
	console.trace('EXIT');
	exit(1);
};

exports.load = function load(file) {
	Promise.resolve().then(() => {
		return require(file).default();
	}).then(() => {
		fancyLog('Done.');
	}, (e) => {
		const stack = e.stack.split(/\n/);
		if (stack.length > 3) {
			stack.pop(); // root file
			stack.pop(); // function main()
		}
		if (process.stderr.isTTY) {
			fancyLog('\x1B[38;5;9m%s\x1B[0m', stack.join('\n'));
		} else {
			fancyLog(stack.join('\n'));
		}
		process.exit(e.code || 1);
	});
};
