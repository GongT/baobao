import { getPackageManager } from './common/getPackageManager';

function matchCmd(cmd: string, match: string) {
	return match.startsWith(cmd) && cmd.length <= match.length;
}

export default async function () {
	const cmd = process.argv[2];
	const args = process.argv.slice(3);
	console.error('finding package manager');
	const pm = await getPackageManager();
	console.error('detected package manager: %s', pm.friendlyName);
	if (matchCmd(cmd, 'install-dev') || matchCmd(cmd, 'add-dev') || matchCmd(cmd, 'dev')) {
		await pm.installDev(...args);
	} else if (matchCmd(cmd, 'install') || matchCmd(cmd, 'add')) {
		await pm.install(...args);
	} else if (matchCmd(cmd, 'uninstall') || matchCmd(cmd, 'remove') || matchCmd(cmd, 'erase')) {
		await pm.uninstall(...args);
	} else if (matchCmd(cmd, 'run')) {
		await pm.run(args[0], ...args.slice(1));
	} else if (cmd === 'init') {
		await pm.init();
	} else {
		await pm.invokeCli(args[0], ...args.slice(1));
	}
}
