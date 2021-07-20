require('./prepare');

const cp = require('child_process');
let cmd = process.argv[1];
const args = process.argv.slice(2);

if (!require('fs').existsSync(cmd)) {
	cmd = require('path').basename(cmd);
}

let color = '',
	reset = '';
if (process.stdout.isTTY) {
	color = '\x1B[2m';
	reset = '\x1B[0m';
}

console.log('%s$ %s %s%s', color, cmd, args.join(' '), reset);
const p = cp.spawnSync(cmd, args, { stdio: 'inherit' });

require('./end.js');

process.exit(p.status);
