export let currentPlugin: string = '';
export let currentArgs: string[] | null;

export function setCtxDisable() {
	currentPlugin = '';
	currentArgs = [];
}

export function setCtxEnable(plugin: string, args?: string[]) {
	currentPlugin = plugin;
	if (args) {
		currentArgs = args.slice();
	} else {
		currentArgs = [];
	}
}
