export function printUsage() {
	console.log('Usage: my-cli <command>');
	console.log();
	console.log('Commands:');
	console.log('  build   run build');
	console.log('  watch   start watch mode');
	console.log('  clean   cleanup the project');
	console.log('  init    create config/commands.json');
}
