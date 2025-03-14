export type * from './include/file.js';
export { CustomFileWriter } from './include/writer.js';

export interface IPluginOptions {
	quiet?: boolean;
	clearScreen?: boolean;
	cache?: boolean;
	delete?: boolean;
}
