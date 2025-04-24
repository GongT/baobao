import { camelCase, lcfirst, ucfirst } from '@idlebox/common';
import { execa } from 'execa';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const manArgs = ['--encoding=utf-8', '--no-hyphenation', '--no-justification', '--pager=cat', '--locale=en-us'];
const fastStopSignals = ['EXAMPLES', 'SEE ALSO'];
const nameLine = /^ {7}[a-z0-9_]+=/i;
const titleLine = /^\S/;

async function extractPage(...args: string[]) {
	const ret = await execa('man', manArgs.concat(args), { stdio: 'pipe', all: true });
	if (ret.exitCode !== 0) {
		throw new Error(`failed print man page for: ${args.join(' ')}`);
	}
	return ret.all!;
}
const outDir = resolve(fileURLToPath(import.meta.url), '../../../src/types/created');

const prefix = `
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';
`;

const types = [
	'automount',
	'dnssd',
	'device',
	'exec',
	'kill',
	'link',
	'mount',
	'netdev',
	'network',
	'nspawn',
	'path',
	'resource-control',
	'scope',
	'service',
	'socket',
	'swap',
	'timer',
	'unit',
];
for (const type of types) {
	const outputFile = resolve(outDir, `${type}.ts`);

	const rawContent = await extractPage(`systemd.${type}`);

	const lines = rawContent.split('\n');

	let possibleTitle = '';
	const sections: IContent[] = [];
	const collectedLines: string[] = [];
	const collectedDocs: string[] = [];
	let docs = '';

	for (const line of lines) {
		if (titleLine.test(line)) {
			collectedDocs.push(docs);
			docs = '';

			if (collectedLines.length > 0) {
				collectedDocs.shift();
				const vars = flattenVars(collectedLines, collectedDocs);
				if (vars.length) {
					sections.push(createSection(type, possibleTitle, vars));
				}
			}

			collectedLines.length = 0;
			collectedDocs.length = 0;

			possibleTitle = line;
		} else if (nameLine.test(line)) {
			collectedDocs.push(docs);
			docs = '';
			collectedLines.push(line.trim());
		} else if (collectedLines.length) {
			docs += `${line} `;
		}

		if (fastStopSignals.includes(line)) break;
	}

	console.log('write %s', outputFile);
	const contents = sections.map((e) => e.content);
	let all = '';

	if (sections.length > 1) {
		const ifs = sections.map((e) => e.interface);
		all = `export type __I${ucfirst(camelCase(type))}All = ${ifs.join(' & ')};`;
	}

	await writeFile(
		outputFile,
		`${prefix}
${contents.join('\n')}
${all}
`
	);
}

await writeFile(
	resolve(outDir, '../all.ts'),
	`${types.map((x) => `export type * from './created/${x}.js';`).join('\n')}\n`
);

interface IVar {
	parent: string;
	name: string;
	doc: string;
}

interface IContent {
	interface: string;
	content: string;
}

function flattenVars(lines: string[], docs: string[]) {
	const parts: IVar[] = [];
	for (const [index, line] of lines.entries()) {
		let first = '';
		for (let item of line.split(',')) {
			item = item.trim();
			if (!item || /\s/.test(item)) continue;
			item = item.split('=')[0];

			if (!first) first = item;
			parts.push({ name: item, parent: first, doc: docs[index] || '' });
		}
	}
	return parts;
}

function createSection(unitType: string, title: string, vars: readonly IVar[]): IContent {
	const listReg = /Takes one of [^\.]+\./i;
	const gotTitle = /^\[([a-z]+)\]/i.exec(title);

	let append;
	if (title === 'OPTIONS') {
		append = 'Section';
		title = '';
	} else if (gotTitle) {
		append = 'Section';
		title = ucfirst(camelCase(gotTitle[1]).toLowerCase());
	} else {
		append = 'Options';
		title = ucfirst(camelCase(title.toLowerCase().replace(/[^a-z0-9]/gi, '_')));
	}
	const ifName = `I${ucfirst(camelCase(unitType))}${title}${append}`;
	const varName = `${lcfirst(camelCase(unitType))}${title}Fields`;
	const body = [];

	for (const { name, parent, doc } of vars) {
		let typedef = 'MaybeArray<string>';

		if (doc.includes('if true') || doc.includes('if false')) {
			typedef = 'MaybeArray<BooleanType>';
		} else if (doc.includes('Takes a list of')) {
			typedef = 'string[]';
		} else if (name.includes('Timeout')) {
			typedef = 'string | number';
		} else {
			const r = listReg.exec(doc);
			if (r) {
				const list = r[0]
					.slice(13, -1)
					.replace(/[,"]/g, '')
					.replace(/\(.+\)/g, '')
					.split(/\s+/)
					.filter((e) => e && e !== 'and' && e !== 'or');
				typedef = `${list.map((e) => JSON.stringify(e)).join(' | ')} | string`;
			}
		}
		body.push(`\t/** @see https://www.freedesktop.org/software/systemd/man/systemd.${unitType}.html#${parent}= */`);
		body.push(`\t${name}?: ${typedef};`);
	}

	return {
		interface: ifName,
		content: `export interface ${ifName} {
${body.join('\n')}
}

export const ${varName}: readonly string[] = [${vars.map((e) => JSON.stringify(e.name)).join(',')}];
`,
	};
}
