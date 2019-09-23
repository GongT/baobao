import { createInterface } from 'readline';
import { IOptions, KNOWN_PACKAGE_MANAGERS } from './getPackageManagerByName';
import { PackageManager } from './packageManager';

export async function getPackageManager(_options?: Partial<IOptions>): Promise<PackageManager> {
	const options: IOptions = Object.assign({}, _options || {}, {
		cwd: process.cwd(),
		default: 'auto',
		ask: true,
	});

	const all: PackageManager[] = KNOWN_PACKAGE_MANAGERS.map((Manager) => {
		return new Manager(options.cwd);
	});

	const detected = await new Promise<PackageManager | undefined>((resolve) => {
		let ps = all.map(pm => {
			pm.detect().then((found) => {
				if (found) {
					console.log('find %s result = %s', pm.friendlyName, found);
					resolve(pm);
				}
			});
		});
		Promise.all(ps).finally(() => resolve());
	});
	console.log('find result = %s', detected);

	await Promise.all(all.map((pm) => {
		return pm.detect().then((found) => {
			return found ? pm : undefined;
		});
	}));
	if (detected) {
		return detected;
	}

	const installed = (await Promise.all(all.map((pm) => {
		return pm.exists().then((found) => {
			return found ? pm : undefined;
		});
	}))).filter(e => !!e) as PackageManager[];

	if (options.ask && process.stdin.isTTY) {
		const selection = await askUserSelect(installed);
		if (selection) {
			return selection;
		}
	}

	if (options.default === 'auto') {
		if (installed.length) {
			return installed[0];
		} else {
			return all[0];
		}
	}

	for (const item of installed) {
		if (item.friendlyName === options.default) {
			return item;
		}
	}

	return all[0];
}

async function askUserSelect(installed: PackageManager[]): Promise<PackageManager | undefined> {
	if (installed.length === 0) {
		return undefined;
	}
	console.error(`Can't detect package manager type, please select one from below:`);
	for (const [index, item] of installed.entries()) {
		console.error('  \x1B[38;5;14m[%s]\x1B[0m: %s', index, item.friendlyName);
	}
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
		historySize: 0,
		prompt: '> ',
	});

	let selection: number = -1;
	await new Promise((resolve) => {
		rl.on('line', (line) => {
			selection = parseInt(line);
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
