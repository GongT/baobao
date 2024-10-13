import * as api from '.';
import { resolve } from 'path';
import { inspect } from 'util';
import ts from 'typescript';
import { getOptions } from './inc/load-tsconfig';

const options = getOptions(resolve(__dirname, '../test'), true);
const p = new api.TypescriptProject(ts, options);
p.additionalIgnores.add('**/*.ignore.ts');
const list = p.execute();
console.log(
	list
		.map((e) => {
			return inspect(e, { colors: true });
		})
		.join('\n')
);
// console.log(inspect(list, { colors: true }));
