import { findUpUntil } from '@idlebox/node';
import { getPackageManager } from './common/getPackageManager.js';
import { formatPackageJson } from './local/formatPackageJson.js';

function getArgs() {
	const args = process.argv.slice(2);

	const cmdAt = args.findIndex((e) => !e.startsWith('-'));

	if (cmdAt === -1) {
		return { cmd: '', args: [] };
	}
	const cmd = args.splice(cmdAt, 1)[0];
	return { cmd, args };
}

/** @internal */
export default async function () {
	const { cmd, args } = getArgs();

	let packageJson = (await findUpUntil(process.cwd(), 'package.json')) || undefined;

	// console.error('finding package manager');
	const pm = await getPackageManager({ packageJson });
	// console.error('detected package manager: %s', pm.friendlyName);

	const requirePackage = () => {
		if (!packageJson) {
			console.error('missing package.json');
			process.exit(1);
		}
		return packageJson;
	};

	if (!cmd) {
		console.error('Usage: unpm <command> <...packages>');
		console.error('  * install, add, i, a                   - install package (can follow --dev/-D)');
		console.error('  * uninstall, un, remove, rm, erase     - remove package');
		console.error('  * run                                  - run npm script or node_modules/.bin');
		console.error('  * init                                 - run init script');
		console.error('  * show, view                           - get and show package info from registry');
		console.error('  * format-package                       - format package.json (-i write back)');
		console.error('other command: direct pass to package manager.');
		process.exit(1);
	}
	if (cmd === 'install' || cmd === 'add' || cmd === 'i' || cmd === 'a') {
		await pm.install(...args);
	} else if (cmd === 'uninstall' || cmd === 'un' || cmd === 'remove' || cmd === 'rm' || cmd === 'erase') {
		await pm.uninstall(...args);
	} else if (cmd === 'run' || cmd === 'r') {
		requirePackage();
		await pm.run(args[0], ...args.slice(1));
	} else if (cmd === 'init') {
		// TODO: rush init
		await pm.init(...args);
	} else if (cmd === 'show' || cmd === 'view') {
		await pm.show(...args);
	} else if (cmd === 'publish') {
		requirePackage();
		// TODO: publish config files
		await pm.invokeCli(cmd, ...args);
	} else if (cmd === 'format-package') {
		const packageJson = requirePackage();
		await formatPackageJson(packageJson, args);
	} else {
		requirePackage();
		await pm.invokeCli(cmd, ...args);
	}
}
