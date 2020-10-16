import { resolve } from 'path';
import { readJsonSync } from 'fs-extra';
import { describe, it } from 'mocha';

const CASES_ROOT = __filename.endsWith('.ts')
	? resolve(__dirname, '../../lib/tests/case')
	: resolve(__dirname, '../case');

export enum ImportType {
	TYPE = 0,
	VALUE = 1,
}

class ExpectedError extends Error {
	constructor(msg: string) {
		super(msg);
		this.stack = this.message;
	}
}

interface ImportDef {
	[identifier: string]: ImportType;
}

export class ExpectedRecord {
	constructor(public readonly specifier: string, public readonly imports: ImportDef) {}

	public itemsStr() {
		return Object.keys(this.imports).join(',');
	}

	it(inputs: any) {
		let foundModule: any;
		it(`should import "${this.specifier}"`, () => {
			const infoImports = [...inputs.internals, ...inputs.externals];
			foundModule = infoImports.find((item) => {
				return item.specifier === this.specifier;
			});
			if (!foundModule) {
				throw new Error('no such import');
			}
		});

		for (const [identifier, kind] of Object.entries(this.imports)) {
			it(`# identifier "${identifier}" should be a ${ImportType[kind].toLowerCase()}`, () => {
				let list: string[], another: string[], wrongType: string, index: number;
				if (kind === ImportType.TYPE) {
					list = foundModule.types;
					another = foundModule.identifiers;
					wrongType = ImportType[ImportType.VALUE].toLowerCase();
				} else {
					list = foundModule.identifiers;
					another = foundModule.types;
					wrongType = ImportType[ImportType.TYPE].toLowerCase();
				}

				index = another.indexOf(identifier);
				if (index !== -1) {
					another.splice(index, 1);
					throw new ExpectedError(`oops, is a ${wrongType}`);
				}
				index = list.indexOf(identifier);
				if (index === -1) {
					throw new ExpectedError(`no such identifier`);
				} else {
					list.splice(index, 1);
				}
			});
		}

		it(`should not import anything else`, () => {
			const extra = [].concat(foundModule.types, foundModule.identifiers);
			if (extra.length > 0) {
				throw new ExpectedError('redundant: ' + extra.join(', '));
			}
		});
	}
}

let num = 0;
export function testCase(file: string, title: string, actions: ExpectedRecord[]) {
	num++;
	describe(`Case:${num} - ${title}`, async () => {
		let data: any = {};
		before(`load importinfo file "${file}"`, () => {
			const content = readJsonSync(resolve(CASES_ROOT, file + '.js.importinfo'));
			Object.assign(data, content);
		});

		for (const action of actions) {
			action.it(data);
		}
	});
}
