const { spawnSync } = require('child_process');

module.exports.exec = function exec(target, argv) {
	process.env.EXEC_BY_PNPM = 'yes';

	let kexec;
	try {
		kexec = require('node-kexec');
	} catch {}

	if (kexec) {
		kexec(process.execPath, [target, ...argv]);
	}

	const r = spawnSync(process.execPath, [target, ...argv], { stdio: 'inherit', shell: false });

	process.exit(r.status ?? 1);
};
