console.error(process.cwd());
if (!require(process.cwd() + '/package.json').scripts.watch) {
	console.error('no watch');
	process.exit(0);
}

const { spawn } = require('child_process');
const { resolve, relative } = require('path');
const split2 = require(resolve(__dirname, '../common/temp/node_modules/split2'));

const clearSeq = /\x1Bc/g;
const timePart = /^[\x1B\[;m0-9]*\d+:\d+:\d+(?: [ap]m)?[\x1B\[\];m0-9]*\s(?:- )?/i;
const compileComplete = /Found 0 errors?\. Watching for file changes\./;
const compileError = /Found [0-9]+ errors?\. Watching for file changes\./;
const filePath = /^.+\.ts\(\d+/;

const relativeToRoot = relative(resolve(__dirname, '..'), process.cwd());

const p = spawn('npm', ['run', 'watch'], { stdio: ['ignore', 'pipe', 'inherit'] });

stdoutHandle(p.stdout);

p.on('error', (e) =>
	setImmediate(() => {
		throw e;
	}),
);
p.on('exit', (code, signal) => {
	console.error('process quit with code %s, signal %s', code, signal);
	if (signal) process.kill(process.pid, signal);
	if (code === 0) {
		process.exit(1);
	} else {
		process.exit(code);
	}
});

function stdoutHandle(stdout) {
	const split = stdout.pipe(split2());
	split.on('data', function filterPassthrough(line) {
		let data = line.toString();

		data = data.replace(timePart, '').replace(clearSeq, `\x1Bc[${relativeToRoot}] ${process.cwd()}/package.json\n`);

		if (compileComplete.test(data)) {
			title('✅');
		} else if (compileError.test(data)) {
			title('❌');
		} else if (filePath.test(data)) {
			data = `${relativeToRoot}/${data}\n`;
		}
		console.log(data);
	});
}

function title(s) {
	process.stdout.write(`\x1Bk${s}\x1B\\`);
}
