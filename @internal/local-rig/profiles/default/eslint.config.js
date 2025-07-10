import eslint from '@eslint/js';
import { resolve } from 'node:path';
import tseslint from 'typescript-eslint';
import { inspect } from 'node:util';

const importedRules = {};
Object.assign(importedRules, eslint.configs.recommended.rules, ...tseslint.configs.recommended.map((e) => e.rules));

const notuse = [
	'prefer-const',

	'@typescript-eslint/no-explicit-any',
	'@typescript-eslint/no-this-alias',
	'@typescript-eslint/no-unused-vars',
];
for (const name of Object.keys(importedRules)) {
	if (name.startsWith('no-un') || notuse.includes(name)) {
		importedRules[name] = 'off';
	}
}

console.log(inspect(importedRules, false, 3, true));

export function createConfig(packageRoot) {
	return tseslint.config({
		files: ['src/**/*.ts'],
		ignores: ['src/**/*.test.ts'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			sourceType: 'module',
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: resolve(packageRoot, 'src'),
			},
		},
		rules: {
			...importedRules,
			'no-restricted-imports': [
				'error',
				{
					patterns: [{ group: ['**/lib', '**/autoindex*', '**/_*'], message: '导入路径错误' }],
				},
			],
		},
	});
}
