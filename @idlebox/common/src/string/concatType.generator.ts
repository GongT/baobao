import { readFileSync } from 'fs';

/* copy */
export function concatStringType(a: string[]): string {
	return a.join('');
}
/* copy end */

export function generate() {
	let content = '';
	const typeList = [];
	const argList = [];
	const returnList = [];
	for (let i = 0; i < 20; i++) {
		typeList.push(`T${i} extends string`);
		argList.push(`t${i}: T${i}`);
		returnList.push(`\${T${i}}`);

		const type = typeList.join(', ');
		const arg = argList.join(',\n\t');
		const ret = returnList.join('');
		content += `export function concatStringType<${type}>(\n\t${arg}\n): \`${ret}\`;\n`;
	}

	const full: string = readFileSync(import.meta.url.replace(/^file:\/\//, ''), 'utf-8');
	const lines = full.split('\n');
	content += '\n';
	content += lines.slice(lines.indexOf('/* copy */'), lines.indexOf('/* copy end */')).join('\n');

	return content;
}