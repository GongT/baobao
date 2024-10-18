export function concatStringType(a: string[]): string {
	return a.join('');
}

export function generate(builder: any) {
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
		builder.append(`export function concatStringType\n\t<${type}>\n\t\t(${arg}):\n\t\`${ret}\`;`);
	}

	builder.copyFunctionDeclare('concatStringType');
}
