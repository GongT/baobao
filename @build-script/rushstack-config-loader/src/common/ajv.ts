import Ajv, { type ErrorObject } from 'ajv';
import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';

// https://github.com/ajv-validator/ajv-errors/issues/157
// import ajvErrors from 'ajv-errors';

export function validateSchema(object: any, schemaFile: string): boolean {
	const ajv = new Ajv({ allErrors: true, strict: false });

	const validate = loadSchemaFile(ajv, schemaFile);

	const valid = validate(object);

	if (validate.errors) {
		throw new ValidationError(validate.errors);
	}

	return valid;
}

function loadSchemaFile(ajv: Ajv, schemaFile: string): any {
	try {
		const schema = JSON.parse(readFileSync(schemaFile, 'utf-8'));
		return ajv.compile(schema);
	} catch (e: any) {
		if (e instanceof SyntaxError) {
			throw new Error(`invalid JSON schema file: ${schemaFile} - ${e.message}`);
		}
		throw e;
	}
}

function formatError(error: ErrorObject, level = 0): string {
	const pad = '    '.repeat(level) + (level > 0 ? '-> ' : '* ');

	let message = '';
	const { errors, ...params } = error.params;
	message += `${pad}.${error.instancePath} (${error.schemaPath}): ${error.message}`;

	if (Object.keys(params).length > 0) {
		message += `: ${inspect(params, { depth: 2, compact: true })}`;
	}
	if (errors && errors.length > 0) {
		for (const error of errors) {
			message += `\n${formatError(error, level + 1)}`;
		}
	}
	return message;
}

export class ValidationError extends Error {
	constructor(public readonly errors: readonly ErrorObject[]) {
		let message = '';
		for (const error of errors || []) {
			message += `\n  ${formatError(error)}`;
		}

		super(message, { cause: errors });

		this.name = 'ValidationError';
	}
}
