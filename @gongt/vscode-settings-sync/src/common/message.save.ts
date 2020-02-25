import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { onExtensionActivate, context } from '@gongt/vscode-helpers';

let handle: StatusBarItem | null = null;

interface MyButton {
	text: string;
	tooltip: string;
	command: string;
}

export function setButton(opt: MyButton) {
	disposeButton();
	handle = window.createStatusBarItem(StatusBarAlignment.Left, 0);
	handle.text = opt.text;
	handle.command = opt.command;
	handle.tooltip = '[Setting Sync] ' + opt.tooltip;
	handle.show();
}

onExtensionActivate(() => {
	context.subscriptions.push({
		dispose: disposeButton,
	});
});
export function disposeButton() {
	if (handle) {
		handle.dispose();
		handle = null;
	}
}
