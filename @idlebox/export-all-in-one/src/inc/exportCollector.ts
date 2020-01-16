import { debug } from './debug';

interface ICreateOption {}

export class ExportCollector {
	private text: string[] = [];
	private imports = new Map<string, string[]>();

	normalize() {
		const knownName: { [id: string]: string } = {};
		for (const [file, list] of this.imports.entries()) {
			if (list.includes('*') && list.length !== 1) {
				throw new Error(`Cannot export other values if * already exported. file: "${file}"`);
			}
			for (const name of list) {
				if (knownName[name]) {
					console.error(this.imports);
					throw new Error(`Found identifier <${name}> exported from multiple file:\n  * ./${file}\n  * ./${knownName[name]}`);
				}
				console.log('%s -> %s', name, file);
				knownName[name] = file;
			}
		}
	}

	createESM({}: ICreateOption): string {
		const ret: string[] = [];

		for (const [file, list] of this.imports.entries()) {
			if (list[0] === '*') {
				ret.push(`export * from "./${file}"`);
			} else {
				ret.push(`export { ${list.join(', ')} } from "./${file}"`);
			}
		}

		return this.text.concat(ret).join('\n');
	}
	createCJS(): string {
		throw new Error('Method not implemented.');
	}
	addText(text: string) {
		this.text.push(text);
	}
	addTransform(source: string, identifier: string) {
		debug('     add default tramsform "%s" from "%s"', identifier, source);
		this.addModule('default as ' + identifier, source);
	}
	addExport(source: string, identifiers: string[]) {
		debug('     add export [%s] from "%s"', identifiers.join(', '), source);
		this.addModule(identifiers, source);
	}

	private addModule(identifier: string | string[], source: string) {
		source = source.replace(/^\.\//, '');
		const map = this.imports;
		if (!map.has(source)) {
			map.set(source, []);
		}
		if (Array.isArray(identifier)) {
			map.get(source)!.push(...identifier);
		} else {
			map.get(source)!.push(identifier);
		}
	}
}
