import type { IFormatterConstructor } from '../api/types.js';

export let defaultFormatFactory: null | IFormatterConstructor<any>;

export function setDefaultFormatter(formatter: IFormatterConstructor<any>, force: boolean = true) {
	if (defaultFormatFactory && !force) {
		return;
	}
	defaultFormatFactory = formatter;
}
