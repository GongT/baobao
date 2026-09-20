import type { IFormatter, IFormatterConstructor } from '../api/types.js';
import { BiomeBinaryFormat } from '../extra/biomeFormat.js';
import { PrettierFormat } from '../extra/prettierFormat.js';

let DefaultFormatterClass: IFormatterConstructor<any>;
export function setDefaultFormatter(formatter: IFormatterConstructor<any>, force: boolean = true) {
	if (DefaultFormatterClass && !force) {
		return;
	}
	DefaultFormatterClass = formatter;
}

export async function createFormatterInstance(text?: string, file?: string): Promise<IFormatter<any>> {
	if (!DefaultFormatterClass) {
		if (await BiomeBinaryFormat.detectBinary()) {
			DefaultFormatterClass = BiomeBinaryFormat;
		} else {
			DefaultFormatterClass = PrettierFormat;
		}
	}
	return DefaultFormatterClass.createInstance(text, file);
}
