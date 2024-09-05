/** @type {import("prettier").Config} */
module.exports = {
	printWidth: 120,
	semi: true,
	singleQuote: true,
	quoteProps: 'as-needed',
	jsxSingleQuote: false,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	requirePragma: false,
	insertPragma: false,
	endOfLine: 'lf',
	useTabs: true,
	overrides: [
		{
			files: ['*.yaml', '*.yml'],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: ['*.js', '*.mjs', '*.cjs'],
			options: {
				parser: 'typescript',
			},
		},
		{
			files: ['*.json'],
			excludeFiles: ['package.json'],
			options: {
				parser: 'json',
				quoteProps: 'consistent',
				singleQuote: false,
			},
		},
	],
};
