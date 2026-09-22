import type { IFormatterConstructor } from '../api/types.js';
import { createBiomeFormatter } from '../extra/optional.biome.js';
import { createPrettierFormat } from '../extra/prettierFormat.js';

export let defaultFormatFactory: null | IFormatterConstructor<any> = createBiomeFormatter ?? createPrettierFormat;

export function setDefaultFormatter(formatter: IFormatterConstructor<any>, force: boolean = true) {
	if (defaultFormatFactory && !force) {
		return;
	}
	defaultFormatFactory = formatter;
}
