import { resolve } from 'path';
import { readJsonSync } from 'fs-extra';
import { describe, it } from 'mocha';
import { IImportInfoFile, ImportWithInfo } from '../../src/info';

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

	it(inputs: IImportInfoFile) {
		let foundModule: ImportWithInfo;
		it(`should import "${this.specifier}"`, () => {
			const infoImports = inputs.imports;
			const found = infoImports.find((item) => {
				return item.specifier === this.specifier;
			});
			if (!found) {
				throw new Error('no such import');
			}
			foundModule = found;
		});

		for (const [identifier, kind] of Object.entries(this.imports)) {
			it(`# identifier "${identifier}" should be a ${ImportType[kind].toLowerCase()}`, () => {
				let list: string[], another: string[], wrongType: string, index: number;
				if (kind === ImportType.TYPE) {
					list = foundModule.types;
					another = foundModule.values;
					wrongType = ImportType[ImportType.VALUE].toLowerCase();
				} else {
					list = foundModule.values;
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

		it(`# should not import anything else`, () => {
			const extra: string[] = [''].concat(foundModule.values, foundModule.types);
			if (extra.length > 1) {
				extra.shift();
				throw new ExpectedError('redundant: ' + extra.join(', '));
			}
		});
	}
}

let num = 0;
export function testCase(file: string, title: string, actions: ExpectedRecord[]) {
	num++;
	describe(`Case:${num}(${file}) - ${title}`, async () => {
		let data: IImportInfoFile = {} as any;
		before(`load importinfo file "${file}"`, () => {
			const mapFile = resolve(CASES_ROOT, file + '.js.importinfo');
			console.log('\t\x1B[2m%s\x1B[0m', mapFile);
			const content = readJsonSync(mapFile);
			Object.assign(data, content);
		});

		for (const action of actions) {
			action.it(data);
		}

		it(`should not import anything else`, () => {
			const externals: Record<string, boolean> = {};
			if (data.imports) {
				for (const item of data.imports) {
					externals[item.specifier] = true;
				}
			}
			for (const action of actions) {
				delete externals[action.specifier];
			}
			const externalArr = Object.keys(externals);
			if (externalArr.length > 0) {
				throw new ExpectedError('should not import anything from: ' + externalArr.join(', '));
			}
		});
	});
}
