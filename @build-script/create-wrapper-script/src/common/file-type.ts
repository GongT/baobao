import { extname } from 'node:path';

/**
 * 根据文件扩展名来确定使用的解释器
 */
export function identifyScriptType(target: string): string[] | undefined {
	const ext = extname(target);
	switch (ext) {
		case '.js':
		case '.mjs':
		case '.cjs':
			return ['node'];
		case '.ts':
		case '.tsx':
		case '.mts':
		case '.cts':
			return ['vite-node'];
		case '.py':
			return ['python'];
		case '.go':
			return ['go', 'run'];
		case '.sh':
			return ['bash'];
		case '.bat':
		case '.cmd':
			return ['cmd', '/c'];
		case '.pl':
			return ['perl'];
		case '.ps1':
			return ['pwsh', '-File'];
		case '.rb':
			return ['ruby'];
		default:
			return undefined;
	}
}
