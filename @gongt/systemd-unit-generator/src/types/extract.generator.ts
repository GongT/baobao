import type { GenerateContext } from '@build-script/codegen';
import { camelCase, SimpleStateMachine, ucfirst } from '@idlebox/common';
import { execa } from 'execa';
import assert from 'node:assert';

const fastStopSignals = ['EXAMPLES', 'SEE ALSO'];
const nameLine = /^ {7}([a-z0-9_]+=(, |$))+/i;
const titleLine = /^\S/;

async function extractPage(...args: string[]) {
	const ret = await execa({
		stdio: ['ignore', 'pipe', 'ignore'],
		env: {
			MANWIDTH: '180',
		},
	})`man --encoding=utf-8 --no-hyphenation --no-justification --pager=cat --locale=en-us ${args}`;
	if (ret.exitCode !== 0) {
		throw new Error(`failed print man page for: ${args.join(' ')}`);
	}
	return ret.stdout;
}

const prefix = `
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';
`;

const types = [
	'exec',
	'automount',
	'dnssd',
	'device',
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

enum State {
	Init, // = 'state:init',
	SectionBody, // = 'state:body',
	VariableHeader, // = 'state:variable',
	VariableBody, // = 'state:text',
}
enum Event {
	FoundSection, // = 'event:section',
	FoundVariable, // = 'event:variable',
	FoundText, // = 'event:text',
}

const rules = new Map();
const common = [
	// 找到章节标题
	[Event.FoundSection, State.SectionBody],
] as const;

rules.set(State.Init, new Map(common));

rules.set(
	State.SectionBody,
	new Map([
		...common,
		// 找到变量
		[Event.FoundVariable, State.VariableHeader],
		// 前置text
		[Event.FoundText, State.SectionBody],
	]),
);

rules.set(
	State.VariableHeader,
	new Map([
		...common,
		// 找到变量
		[Event.FoundVariable, State.VariableHeader],
		// 找到body
		[Event.FoundText, State.VariableBody],
	]),
);

rules.set(
	State.VariableBody,
	new Map([
		...common,
		[Event.FoundVariable, State.VariableHeader],
		// 找到body
		[Event.FoundText, State.VariableBody],
	]),
);

interface IVar {
	names: string[];
	doc: string[];
}

interface IContent {
	title: string;
	content: string[];
	variables: IVar[];
}

export async function generate(builder: GenerateContext) {
	const indexFile = builder.file('everything.ts');

	for (const type of types) {
		console.log('generating type: %s', type);
		const rawContent = await extractPage(`systemd.${type}`);

		const lines = rawContent.split('\n').slice(1, -1);

		const sections: IContent[] = [];
		let current_section: IContent | undefined;
		const sm = new SimpleStateMachine<State, Event>(rules, State.Init);
		// sm.onStateChange(({ from, to, reason }) => {
		// 	logger.log(`${State[from]} -> ${State[to]} by ${Event[reason]}`);
		// });

		for (const [_lineno, line] of lines.entries()) {
			if (fastStopSignals.includes(line)) break;
			if (!line) continue;

			const last_state = sm.getName();
			if (titleLine.test(line)) {
				if (current_section) {
					if (!current_section.variables.length) {
						sections.pop();
					}
					current_section = undefined;
				}
				logger.debug(line);
				sm.change(Event.FoundSection);
				current_section = {
					content: [],
					title: line
						.replace(/(SECTION )?OPTIONS$/g, '')
						.replace('[', '')
						.replace(']', '')
						.trim()
						.replaceAll(/\s/g, '-')
						.toLowerCase(),
					variables: [],
				};
				sections.push(current_section);
				continue;
			} else if (last_state >= State.SectionBody) {
				if (nameLine.test(line)) {
					logger.debug(line);
					sm.change(Event.FoundVariable);
				} else {
					sm.change(Event.FoundText);
				}
			}

			const next_state = sm.getName();
			switch (next_state) {
				case State.SectionBody:
					if (last_state === State.SectionBody) {
						assert.ok(current_section, 'current_section should be set when section body');
						current_section.content.push(line.trim());
					}
					break;
				case State.VariableHeader:
					assert.ok(current_section, 'current_section should be set when variable header');
					if (last_state === State.VariableHeader) {
						const last_var = current_section.variables.at(-1);
						assert.ok(last_var, 'current_section.variables[-1] should be set when multiple variable header');

						last_var.names.push(...splitVars(line));
					} else {
						current_section.variables.push({
							names: splitVars(line),
							doc: [],
						});
					}
					break;
				case State.VariableBody:
					{
						const cur_var = current_section?.variables.at(-1);
						assert.ok(cur_var, 'current_section.variables[-1] should be set when variable body');
						cur_var.doc.push(line.trim());
					}
					break;
			}
		}

		const typeOutFile = builder.file(`generated/${type}.ts`);
		typeOutFile.append(prefix);

		if (sections.length === 0) {
			logger.error(`no sections found for type ${type}`);
		}

		const sectionNames = new Map<string, string>();
		for (const { title, content: secDoc, variables } of sections) {
			if (variables.length === 0) continue;

			const sectionName = ucfirst(camelCase(title)) || '';
			const typeName = ucfirst(camelCase(type));
			let iface = `I${typeName}`;
			if (typeName !== sectionName) {
				iface += sectionName;
			}
			iface += 'Options';
			sectionNames.set(sectionName || typeName, iface);
			if (secDoc) {
				typeOutFile.append(`/**`);
				for (const line of secDoc) {
					typeOutFile.append(` * ${line.replace('*/', '-/')}`);
					if (!line.includes('│') && !line.includes('─')) typeOutFile.append(` *`);
				}
				typeOutFile.append(` */`);
			}

			const varnames: string[] = [];
			typeOutFile.append(`export interface ${iface} {`);
			for (const { doc, names } of variables) {
				const leader = names[0];
				for (const name of names) {
					typeOutFile.append(`\t/**`);
					for (const line of doc) {
						typeOutFile.append(`\t * ${line.replace('*/', '-/')}`);
						if (!line.includes('│') && !line.includes('─')) typeOutFile.append(`\t *`);
					}
					typeOutFile.append(`\t * @see https://www.freedesktop.org/software/systemd/man/systemd.${type}.html#${leader}=`);
					typeOutFile.append(`\t */`);

					typeOutFile.append(`\t${name}: ${generateType(name, doc.join(' '))};`);

					varnames.push(name);
				}
			}
			typeOutFile.append(`}`);

			// const fieldsName = type === sectionName ? `${sectionName}` : `${type}${ucfirst(sectionName)}`;
			// typeOutFile.append(`const ${fieldsName}Fields = ${JSON.stringify(varnames, null, '\t')};`);
		}

		if (type === 'exec') {
			typeOutFile.append(`export type IExecFields =`);
			for (const [_sectionName, iface] of sectionNames) {
				typeOutFile.append(`\t| ${iface}`);
			}
			typeOutFile.append(`;`);
			indexFile.import(['type', 'IExecFields'], typeOutFile, true);
		} else {
			typeOutFile.append(`export interface I${ucfirst(camelCase(type))}Unit {`);
			for (const [sectionName, iface] of sectionNames) {
				typeOutFile.append(`\t${sectionName}: ${iface};`);
			}
			typeOutFile.append(`}`);
			indexFile.import(['type', ...sectionNames.values()], typeOutFile, true);
		}

		// if (1 - 1 > -1) break;
	}

	const vOut = await execa({})`systemctl --version`;
	const ver = /systemd (\d+) \((.+)\)/.exec(vOut.stdout);
	if (!ver) {
		throw new Error(`cannot parse systemctl version: ${vOut.stdout}`);
	}
	indexFile.append(`export const DocumentVersion = { version: ${JSON.stringify(ver[1])}, codename: ${JSON.stringify(ver[2])} };`);
}

function splitVars(line: string) {
	return line
		.split(',')
		.map((e) => e.trim().replace(/=$/, ''))
		.filter((e) => !!e);
}

const enumReg = /Takes one of [^.]+\./i;
function generateType(name: string, doc: string) {
	let typedef = 'MaybeArray<string>';

	if (doc?.includes('if true') || doc?.includes('if false')) {
		typedef = 'MaybeArray<BooleanType>';
	} else if (doc?.includes('Takes a list of')) {
		typedef = 'string[]';
	} else if (name.includes('Timeout')) {
		typedef = 'string | number';
	} else if (doc) {
		const r = enumReg.exec(doc);
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

	return typedef;
}
