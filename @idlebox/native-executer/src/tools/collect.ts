const shouldCollectFiles = !!process.env.NATIVE_EXECUTER_COLLECTION;
export let collectingFiles: Set<string> | undefined;
if (shouldCollectFiles) {
	collectingFiles = new Set();
	Object.assign(globalThis.__ts_resolver_installed__, { files: collectingFiles });
}

export const verboseLines: string[] = [];

// process.on('beforeExit', () => {
// 	if (verboseLines.length > 0) {
// 		const f = resolve(process.cwd(), './verbose.log');
// 		console.log(`writing verbose log to ${f}...`);
// 		writeFileSync(f, verboseLines.join('\n'), 'utf8');
// 	}
// });
