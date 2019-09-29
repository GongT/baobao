import { Identifier, isStringLiteral, StringLiteral } from 'typescript';

export function idToString(id: Identifier) {
	return id.escapedText.toString();
}

export function nameToString(name: Identifier | StringLiteral) {
	if (isStringLiteral(name)) {
		return name.text;
	} else {
		return name.escapedText.toString();
	}
}