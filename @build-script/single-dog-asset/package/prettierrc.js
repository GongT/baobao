module.exports = {
	printWidth: 120,
	useTabs: true,
	tabWidth: 4,
	semi: true,
	singleQuote: true,
	quoteProps: 'as-needed',
	jsxSingleQuote: false,
	trailingComma: 'es5',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	requirePragma: false,
	insertPragma: false,
	endOfLine: 'lf',
	overrides: [
		{
			files: ['*.yaml', '*.yml'],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: ['package.json'],
			options: {
				parser: 'json',
			},
		},
	],
};
