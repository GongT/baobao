export async function callScript() {
	const argv = process.argv.slice(2);
	const command = argv.find(item => !item.startsWith('-'));

	if (!command) {
		throw new Error('Must set an action to run');
	}

}
