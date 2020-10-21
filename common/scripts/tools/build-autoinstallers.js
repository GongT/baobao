const { spawnSync } = require('child_process');
const { readdirSync, existsSync } = require('fs');
const { resolve } = require('path');

const root = resolve(__dirname, '../../autoinstallers');

for (const item of readdirSync(root)) {
	const pkgFile = resolve(root, item, 'package.json');
	if (!existsSync(pkgFile)) {
		continue;
	}

	spawn('Update', item, 'rush', ['update-autoinstaller', '--name', item]);

	const content = require(pkgFile);
	if (!content.scripts?.postinstall) {
		continue;
	}

	spawn('Build', item, 'npm', ['run', 'postinstall']);
}

function spawn(title, item, cmd, args) {
	console.error('[%s] %s', title, item);
	const result = spawnSync(cmd, args, {
		cwd: resolve(root, item),
		stdio: 'inherit'
	});
	if (result.error) {
		throw result.error;
	}
	if (result.signal) {
		console.error('[%s] "%s %s" killed by signal %s', title, cmd, args.join(' '), result.signal);
		process.exit(1);
	}
	if (result.status !== 0) {
		console.error('[%s] "%s %s" exit with code %s', title, cmd, args.join(' '), result.status);
		process.exit(1);
	}
	console.error('[%s] %s ok', title, item);
}
