import type { IFormatter, IFormatterConstructor } from '../api/types.js';
import { PrettierFormat } from '../extra/prettierFormat.js';

let DefaultFormatterClass: IFormatterConstructor<any>;
export function setDefaultFormatter(formatter: IFormatterConstructor<any>, force: boolean = false) {
	if (DefaultFormatterClass && !force) {
		return;
	}
	DefaultFormatterClass = formatter;
}

export function createDefaultFormatter(text?: string, file?: string): Promise<IFormatter<any>> {
	if (!DefaultFormatterClass) {
		DefaultFormatterClass = PrettierFormat;
	}
	return DefaultFormatterClass.createInstance(text, file);
}
