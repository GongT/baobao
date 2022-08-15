import { resolve } from 'path';
import { generateIndex, IOptions } from './inc/generateIndex';
import { getOptions } from './inc/load-tsconfig';
import { loadFilter } from './inc/loadFilter';
import { consoleLogger, MyError } from './inc/logger';
import { normalizeProject } from './inc/normalizeProject';

const argv = [...process.argv];
const project = getArg('-p');
if (!project) {
	usage();
}
const excludes = [];
while (true) {
	const ex = getArg('--exclude', false);
	if (ex) excludes.push(ex);
	else break;
}
const config = getOptions(resolve(process.cwd(), project), true);

let outputFileName = getArg('--name', true);
// let outputFileName = getArg('--name', false);
// if (!outputFileName) {
// 	const pkgJsonPath = findUpUntilSync(getProjectConfigFile(config), 'package.json');
// 	const typescriptConfig = resolve(pkgJsonPath, '../config/api-extractor.json');
// 	if(existsSync(typescriptConfig)){
// 		const data = loadJsonFileSync(typescriptConfig)
// 	}
// }

try {
	if (argv.includes('--normalize')) {
		normalizeProject({
			project: config,
			logger: consoleLogger,
			tsconfig: config.options.configFilePath,
			indexFile: outputFileName,
			outDir: config.options.outDir,
		});
		process.exit(0);
	}

	const filterFile = getArg('--filter', false);

	const options: IOptions = {
		project: config,
		excludes,
		outFile: outputFileName,
	};

	if (filterFile) {
		options.filter = loadFilter(project, filterFile);
	}

	generateIndex(options);
} catch (e: any) {
	if (e instanceof MyError) {
		die(e.message);
	} else {
		throw e;
	}
}

function die(...msg: any[]): never {
	console.error(...msg);
	process.exit(1);
}

function usage(msg = ''): never {
	if (msg) console.error(msg);
	console.error(
		'Usage: $0 -p src/tsconfig.json [--name index.generated.ts] [--filter output-filter.js] [--exclude **.test.ts]'
	);
	console.error('Usage: $0 -p src/tsconfig.json --normalize');
	process.exit(1);
}

function getArg(name: string, required?: true): string;
function getArg(name: string, required: false): string | undefined;
function getArg(name: string, required = true) {
	const i = argv.indexOf(name);
	if (i === -1) return undefined;

	const ret = argv[i + 1];
	if (!ret) {
		if (!required) {
			return undefined;
		}
		usage('missing value: ' + name);
	}

	argv.splice(i, 2);

	return ret;
}
