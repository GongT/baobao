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
	};
}
export interface IContributeCommand {
	command: string;
	title: string;
	category?: string;
	icon?: ICommandIcon;
}
