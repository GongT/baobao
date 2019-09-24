import { getPackageManager } from './common/getPackageManager';

export default async function () {
	const cmd = process.argv[2].toLowerCase();
	const args = process.argv.slice(3);
	// console.error('finding package manager');
	const pm = await getPackageManager();
	// console.error('detected package manager: %s', pm.friendlyName);
	if (cmd === 'install' || cmd === 'add' || cmd === 'i' || cmd === 'a') {
		await pm.install(...args);
	} else if (cmd === 'uninstall' || cmd === 'un' || cmd === 'remove' || cmd === 'rm' || cmd === 'erase') {
		await pm.uninstall(...args);
	} else if (cmd === 'run' || cmd === 'r') {
		await pm.run(args[0], ...args.slice(1));
	} else if (cmd === 'init') {
		await pm.init();
	} else {
		await pm.invokeCli(cmd, ...args);
	}
}
