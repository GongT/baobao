import { readFile as readFileAsync } from 'fs';
import { dirname } from 'path';
import { promisify } from 'util';
import { jspmResolveModuleAsync, makeName } from './common/lib';

const readFile = promisify(readFileAsync);

const defaultImport = /^import (?<def>[a-z0-9_$]+) from '(?<fro>[^.].+)';$/gim;
const namedImport = /^import { (?<nam>[a-z0-9_$ ,]+) } from '(?<fro>[^.].+)';$/gim;
const namespaceImport = /^import \* as (?<ns>[a-z0-9_$]+) from '(?<fro>[^.].+)';$/gim;
const defaultWithNamespaceImport = /^import (?<def>[a-z0-9_$]+), \* as (?<ns>[a-z0-9_$]+) from '(?<fro>[^.].+)';$/gim;
const defaultWithNamedImport = /^import (?<def>[a-z0-9_$]+), { (?<nam>[a-z0-9_$ ,]+) } from '(?<fro>[^.].+)';$/gim;
const regTypes = [defaultImport, namedImport, namespaceImport, defaultWithNamespaceImport, defaultWithNamedImport];
const jsExt = /\.js$/;
const dewExt = '.dew.js';

interface IResult {
	code: string;
	// map: { mappings: string };
}

interface IOptions {
	filename: string;
	external: string[];
}

const def: IOptions = {
	filename: 'input.js',
	external: [],
};

function startsWith(str: string) {
	return (test: string) => {
		return test.startsWith(str);
	};
}

export async function transformModule(originalCode: string, options?: Partial<IOptions>): Promise<IResult> {
	const { filename, external } = Object.assign({}, def, options) as IOptions;

	let code = originalCode;
	const cache = {};
	// const replacedStrings: [string, string][] = [];

	// console.log('%s:\n~~~~~~~~~~~~', fullPath);
	for (const reg of regTypes) {
		// console.log(reg);
		code = await replaceAsync(code, reg, async (_m0, ...args) => {
			// console.log(':%s', _m0);
			const groups: any = args.pop();
			const { def, fro: fromRaw, nam, ns } = groups;
			// console.log('\t%j', { def, nam, ns, fromRaw });
			if (external.length && external.some(startsWith(fromRaw))) {
				// console.log('this is external.');
				return _m0;
			}

			// console.log('\tresolve from: %s', filename);
			const from = await resolveFrom(fromRaw, filename);
			let importedTemp = '_dew$$' + ns;
			let importedName = ns;
			if (!ns) {
				const temp = makeName(fromRaw, filename, cache);
				importedTemp = '_dew$$' + temp;
				importedName = '_dew$' + temp;
			}

			let importStr = `import {dew as ${importedTemp}} from '${from}';const ${importedName}=${importedTemp}();`;
			if (nam || def) {
				importStr += 'const { ';
				if (nam && def) {
					importStr += `${nam.replace(' as ', ': ')}, default: ${def}`;
				} else if (nam) {
					importStr += `${nam.replace(' as ', ': ')}`;
				} else {
					importStr += `default: ${def}`;
				}
				importStr += ` } = ${importedName};`;
			}
			// console.log('-> %s', importStr);

			// replacedStrings.push([_m0, importStr]);
			return importStr;
		});
	}

	/*const map = new SourceMapGenerator({
		file: 'o.js',
		sourceRoot: '/',
	});

	const codeLines = code.split(/\n/g);
	const originalCodeLines = originalCode.split(/\n/g);
	for (const [from, to] of replacedStrings) {
		const fline = findLine(originalCodeLines, from);
		const tline = findLine(codeLines, to);
		const parts = to.split(/;/);
		parts.pop(); // remove last ;
		parts.pop(); // remove last item

		let i = 0;

		for (const part of parts) {
			i += part.length + 1;
			map.addMapping({
				source: 'o.js',
				original: { line: fline + 1, column: 0 },
				generated: { line: tline + 1, column: i },
			});
		}
	}*/

	return {
		code,
	};
}

/*
function findLine(data: string[], lineContent: string): number {
	return data.findIndex(l => l === lineContent);
}*/

export async function transformFile(options: Partial<IOptions> & Pick<IOptions, 'filename'>): Promise<IResult> {
	const data = await readFile(options.filename, 'utf-8');
	return transformModule(data, options);
}

async function resolveFrom(from: string, dbgFull: string) {
	if (from.endsWith('.js')) {
		return from.replace(jsExt, dewExt);
	}
	if (from.includes('/')) {
		console.warn('Warning: not ends with .js: %s (from %s)', from, dbgFull);
	}
	const ret = await jspmResolveModuleAsync(from, dbgFull);
	const pkg = await jspmResolveModuleAsync(from + '/package.json', dbgFull);
	if (ret && ret.resolved && pkg && pkg.resolved) {
		return from + ret.resolved.replace(dirname(pkg.resolved), '').replace(jsExt, dewExt);
	}
	console.error('result: %s - failed to resolve module: %s (from %s)', from, dbgFull);
	return from;
}

async function replaceAsync(str: string, regex: RegExp, replacer: (...args: string[]) => Promise<string>) {
	const runners: (() => Promise<string>)[] = [];
	str.replace(regex, (m0, ...args) => {
		runners.push(() => {
			return replacer(m0, ...args);
		});
		return m0;
	});
	let replaceList: string[] = [];
	for (const runner of runners) {
		replaceList.push(await runner());
	}
	return str.replace(regex, () => replaceList.shift()!);
}
