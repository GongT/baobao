import { install } from '@idlebox/source-map-support';

install({ environment: 'node', ignore: true });

export interface IApp {
	readonly debug: boolean;
	readonly verbose: boolean;
	readonly silent: boolean;
	readonly showHelp: boolean;
	readonly command: string;
	readonly color: boolean;
}

export * from './re-export.js';
export { app, makeApplication } from './startup.js';
