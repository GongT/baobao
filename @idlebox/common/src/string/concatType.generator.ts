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
		const arg = argList.join(', ');
		const ret = returnList.join('');
		content += `export function concatStringType\n\t<${type}>\n\t\t(${arg}):\n\t\`${ret}\`;\n`;
	}

	const full: string = readFileSync(__filename, 'utf-8');
	const lines = full.split('\n');
	content += '\n';
	content += lines.slice(lines.indexOf('/* copy */'), lines.indexOf('/* copy end */')).join('\n');

	return content;
}
