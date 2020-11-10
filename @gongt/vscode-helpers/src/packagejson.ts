export interface ICommandIcon {
	light?: string;
	dark?: string;
}
export interface IPackageJson {
	name: string;
	version: string;
	publisher: string;
	contributes?: {
		commands?: IContributeCommand[];
		keybindings?: IContributeKeybinding[];
	};
}
export interface IContributeCommand {
	command: string;
	title: string;
	category?: string;
	icon?: ICommandIcon;
}
export interface IContributeKeybinding {
	command: string;
	key: string;
	when?: string;
}
