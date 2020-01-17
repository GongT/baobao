import { debug } from './debug';
import { resolve } from 'path';
import { SOURCE_ROOT } from './argParse';
import { inspect } from 'util';

interface ICreateOption {
	extension: boolean;
}
type INameType = IDefault | string;
interface IDefault {
	default: string;
}
function getNameOnly(obj: INameType): string {
	if (isDefault(obj)) {
		return obj.default;
	} else if (isSimpleId(obj)) {
		return obj;
	} else {
		throw new Error('Impossible');
	}
}
function isDefault(obj: any): obj is IDefault {
	return typeof obj === 'object' && obj.default;
}
function isSimpleId(obj: any): obj is string {
	return typeof obj === 'string';
}

export class ExportCollector {
	private text: string[] = [];
	private imports = new Map<string, INameType[]>();

	normalize() {
		const knownName: { [id: string]: string } = {};
		for (const [file, list] of this.imports.entries()) {
			if (list.includes('*') && list.length !== 1) {
				throw new Error(`Cannot export other values if * already exported. file: "${file}"`);
			}
			for (const im of list) {
				const name = getNameOnly(im);
				if (knownName[name]) {
					console.error(
						inspect(this.imports, {
							depth: Infinity,
							colors: true,
							customInspect: false,
							compact: true,
						})
					);
					throw new Error(`Found identifier <${name}> exported from multiple file:
  * ./${resolve(SOURCE_ROOT, file)}
  * ./${resolve(SOURCE_ROOT, knownName[name])}`);
				}
				debug('%s -> %s', name, file);
				knownName[name] = file;
			}
		}
	}

	createTypeScript({ extension }: ICreateOption): string {
		const ret: string[] = [];
		const ext = extension ? '.js' : '';

		for (const [file, list] of this.imports.entries()) {
			if (list[0] === '*') {
				ret.push(`export * from "./${file}${ext}"`);
			} else {
				const importList = list
					.map((obj) => {
						if (isDefault(obj)) {
							return 'default as ' + obj.default;
						} else if (isSimpleId(obj)) {
							return obj;
						} else {
							throw new Error('Impossible');
						}
					})
					.join(', ');
				ret.push(`export { ${importList} } from "./${file}${ext}"`);
			}
		}

		return this.text.concat(ret).join('\n') + '\n';
	}
	addText(text: string) {
		this.text.push(text);
	}
	addTransform(source: string, identifier: string) {
		debug('     add default tramsform "%s" from "%s"', identifier, source);
		this.addModule({ default: identifier }, source);
	}
	addExport(source: string, identifiers: string[]) {
		debug('     add export [%s] from "%s"', identifiers.join(', '), source);
		for (const identifier of identifiers) {
			this.addModule(identifier, source);
		}
	}
	private addModule(identifier: INameType, source: string) {
		source = source.replace(/^\.\//, '');
		const map = this.imports;
		if (!map.has(source)) {
			map.set(source, []);
		}
		const arr = map.get(source)!;
		if (!arr.includes(identifier)) {
			arr.push(identifier);
		}
	}
}
