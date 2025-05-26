import { findUpUntilSync, writeFileIfChangeSync } from '@idlebox/node';
import { execaNode } from 'execa';
import { readFileSync } from 'fs';

export function usageString() {
	return '';
}
export function descriptionString() {
	return '内部开发命令';
}
export function helpString() {
	return '';
}

export async function main() {
	const result = await execaNode(process.argv[1], ['--help'], { all: true, encoding: 'utf8', stdio: 'pipe' });

	const usageText = result.all.trim().replace(/\u001b.+?m/gu, '');

	const readmeFile = findUpUntilSync({ file: 'README.md', from: import.meta.dirname });
	if (!readmeFile) {
		throw new Error('README.md not found');
	}

	const content = readFileSync(readmeFile, { encoding: 'utf8' }).split('\n');

	const output_lines = [];
	const start = '```text id="usage"';
	const end = '```';

	let found_start = false;
	let found_end = false;
	for (const line of content) {
		if (!found_start && line === start) {
			output_lines.push(line);
			output_lines.push(usageText);
			found_start = true;
		} else if (found_start && !found_end) {
			if (line === end) {
				output_lines.push(line);
				found_end = true;
			}
		} else {
			output_lines.push(line);
		}
	}

	if (!found_start || !found_end) {
		throw new Error(`Cannot find usage section in ${readmeFile}`);
	}

	const ch = writeFileIfChangeSync(readmeFile, output_lines.join('\n'));
	if (ch) {
		console.log(`Updated ${readmeFile}`);
	} else {
		console.log(`No changes made to ${readmeFile}`);
	}
}
