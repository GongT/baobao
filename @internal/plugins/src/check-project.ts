import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IHeftTaskPlugin } from '@rushstack/heft';
import { parse } from 'comment-json';

export const PLUGIN_NAME = 'check-project';

interface ICheck {
	tsconfig: {
		placement: string;
		template: Record<string, any>;
		extends: string;
	};
}

export default class CheckProjectPlugin implements IHeftTaskPlugin {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, _options?: void): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const rigPath = configuration.rigConfig.getResolvedProfileFolder();
			const rigName = configuration.rigConfig.rigPackageName;
			const rigProfile = configuration.rigConfig.rigProfile;
			const rigRelPath = configuration.rigConfig.relativeProfileFolderPath;

			const check: ICheck = {
				tsconfig: {},
			} as any;

			check.tsconfig.extends = `${rigName}/${rigRelPath}/tsconfig.json`;
			const physicalPath = resolve(rigPath, 'tsconfig.json');
			check.tsconfig.template = await loadCommentTemplate(physicalPath);

			if (rigName === '@internal/local-rig') {
				session.logger.terminal.writeDebugLine('check simple project');
				check.tsconfig.placement = 'tsconfig.json';
			} else if (rigName === '@internal/dualstack-rig') {
				session.logger.terminal.writeDebugLine('check complex project');
				check.tsconfig.placement = 'src/tsconfig.json';
			} else {
				throw new Error('update plugins/check-project.ts');
			}

			const file = resolve(configuration.buildFolderPath, check.tsconfig.placement);

			try {
				const data = await mustReadJson(file);
				checkJsonConfig(data, check.tsconfig.template, check.tsconfig.extends);
			} catch (e: any) {
				th(`file content verify failed:\n    File: ${file}\n    Template: ${physicalPath}\n${e.message}\n`);
			}

			const pkgPath = resolve(configuration.buildFolderPath, 'package.json');
			try {
				const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
				if (!pkg.devDependencies?.[rigName]) {
					throw new Error(`devDependencies missing rig package (${rigName})`);
				}
				const others = Object.keys(pkg.devDependencies)
					.concat(Object.keys(pkg.dependencies || {}))
					.filter((x) => x.endsWith('-rig') && x !== rigName);

				if (others.length > 0) {
					throw new Error(`dependencies has other rig package (${others.join(', ')})`);
				}

				if (rigName === '@internal/dualstack-rig' && rigProfile === 'all-in-one') {
					const cjsIn = './lib/cjs/__create_index.generated.cjs';
					assert(pkg.main === cjsIn, `main field must be "${cjsIn}"`);
					assert(pkg.exports?.['.']?.require === cjsIn, `exports.require field must be "${cjsIn}"`);

					const esmIn = './lib/esm/__create_index.generated.mjs';
					assert(pkg.module === esmIn, `module field must be "${esmIn}"`);
					assert(pkg.exports?.['.']?.import === esmIn, `exports.import field must be "${esmIn}"`);
				}
			} catch (e: any) {
				th(`file content verify failed:\n    File: ${pkgPath}\n${e.message}\n`);
			}

			session.logger.terminal.writeLine('check complete!');
		});
	}
}

function assert(cond: boolean, message: string) {
	if (!cond) throw new Error(message);
}

function th(msg: string): never {
	const err = new Error(msg);
	err.stack = err.message;
	throw err;
}

async function loadCommentTemplate(path: string) {
	const json = parse(await readFile(path, 'utf-8')) as any;

	const symbols = [Symbol.for('before')];
	const options = json.compilerOptions;
	for (const prop of Object.keys(options)) {
		symbols.push(Symbol.for(`before:${prop}`), Symbol.for(`after:${prop}`));
	}

	for (const symbol of symbols) {
		const comments = options[symbol];
		if (!comments) continue;

		for (const comment of comments) {
			if (comment.type !== 'BlockComment') continue;

			try {
				return parse('{\n' + comment.value.trim() + '\n}', undefined, true) as Record<string, any>;
			} catch (e: any) {
				throw new Error(`template file "${path}" has ${e.message}`);
			}
		}
	}
	throw new Error(`template file "${path}" has no json block comment`);
}

async function mustReadJson(file: string): Promise<any> {
	const data = await readFile(file, 'utf-8');
	try {
		return parse(data, undefined, true);
	} catch (e: any) {
		throw new Error(`failed parse json: ${e.message}`);
	}
}

function checkJsonConfig(data: any, template: Record<string, any>, exValue: string) {
	if (data.extends !== exValue) throw new Error(`"extends" must be "${exValue}"`);

	const cop = data.compilerOptions;
	if (!cop) throw new Error('missing compilerOptions');

	for (const prop of Object.keys(template)) {
		const expect = template[prop];
		const value = cop[prop];
		if (Array.isArray(expect)) {
			if (!Array.isArray(value)) throw new Error(`property "${prop}" should be array`);
			for (const ele of expect) {
				if (!value.includes(ele)) throw new Error(`property "${prop}" should include ${JSON.stringify(ele)}`);
			}
		} else if (expect !== value) {
			throw new Error(`property "${prop}" should be ${JSON.stringify(expect)}`);
		}
	}
}
