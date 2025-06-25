import Ajv, { type ErrorObject } from 'ajv';
import ajvErrors from 'ajv-errors';
import { inspect } from 'node:util';

// import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json' with { type: 'json' };

export function validateSchema(object: any, schema: any): boolean {
	const ajv = ajvErrors(new Ajv({ allErrors: true, strict: false }));
	// ajv.addMetaSchema(draft7MetaSchema);

	const validate = ajv.compile(schema);
	const valid = validate(object);

	if (validate.errors) {
		throw new ValidationError(validate.errors);
	}

	return valid;
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
