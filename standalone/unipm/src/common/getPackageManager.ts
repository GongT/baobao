import { createInterface } from 'node:readline';
import { getPackageManagerByName, KNOWN_PACKAGE_MANAGER_NAMES, KNOWN_PACKAGE_MANAGERS } from './getPackageManagerByName.js';
import type { PackageManager } from './packageManager.js';

export interface IGetPackageManagerOptions {
	cwd: string;
	packageJson?: string;
	default: 'npm' | 'yarn' | 'rush' | 'cnpm' | 'auto';
	ask: boolean;
}

export async function getPackageManager(_options?: Partial<IGetPackageManagerOptions>): Promise<PackageManager> {
	const options: IGetPackageManagerOptions = Object.assign(
		{},
		{
			cwd: process.cwd(),
			default: 'auto',
			ask: true,
		},
		_options || {},
	);

	if (options.packageJson) {
		try {
			const json = require(options.packageJson);
			if (typeof json.packageManager === 'string') {
				for (const name of KNOWN_PACKAGE_MANAGER_NAMES) {
					if (json.packageManager.toLowerCase().startsWith(name)) {
						const PM = getPackageManagerByName(name);
						if (!PM) throw new Error(`package manager driver ${name} not found`);
						return new PM(options.cwd);
					}
				}
			}
		} catch {}
	}

	const packageManagers: PackageManager[] = KNOWN_PACKAGE_MANAGERS.map((Manager) => {
		return new Manager(options.cwd);
	});

	const detected = await new Promise<PackageManager | undefined>((resolve) => {
		const ps = [];
		for (const pm of packageManagers) {
			const p = pm
				.detect()
				.catch()
				.then((pm) => {
					if (pm) resolve(pm);
				});

			ps.push(p);
		}
		Promise.all(ps).finally(() => resolve(undefined));
	});

	if (detected) {
		return detected;
	}

	const installed = (
		await Promise.all(
			packageManagers.map((pm) => {
				return pm.exists().then((found) => {
					return found ? pm : undefined;
				});
			}),
		)
	).filter((e) => !!e) as PackageManager[];

	if (process.env.PREFER_NODE_PM) {
		const pmi = installed.findIndex((item) => item.friendlyName === process.env.PREFER_NODE_PM);
		if (pmi !== 0) {
			const [pm] = installed.splice(pmi, 1);
			installed.unshift(pm);
		}
	}

	if (options.ask && process.stdin.isTTY) {
		const selection = await askUserSelect(installed);
		if (selection) {
			return selection;
		}
	}

	if (options.default === 'auto') {
		if (installed.length) {
			return installed[0];
		}
		return packageManagers[0];
	}

	for (const item of installed) {
		if (item.friendlyName === options.default) {
			return item;
		}
	}

	return packageManagers[0];
}

async function askUserSelect(installed: PackageManager[]): Promise<PackageManager | undefined> {
	if (installed.length === 0) {
		return undefined;
	}
	console.error(`Can't detect package manager type, please select one from below:`);
	for (const [index, item] of installed.entries()) {
		console.error('  \x1B[38;5;14m[%s]\x1B[0m: %s', index, item.friendlyName);
	}
	console.error('> ');

	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		historySize: 0,
		prompt: '> ',
	});

	let selection = -1;
	await new Promise((resolve) => {
		rl.on('line', (line) => {
			selection = Number.parseInt(line, 10);
			if (installed[selection]) {
				resolve(selection);
			} else {
				console.error(`Unknown selection: "${line}"`);
				console.error('> ');
			}
		});
	});

	rl.close();

	return installed[selection];
}
