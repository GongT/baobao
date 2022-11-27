declare module 'scope-css' {
	interface IOptions {
		keyframes: boolean | string;
	}
	export default function scope(input: string, parent: string, options?: IOptions): string;
}
