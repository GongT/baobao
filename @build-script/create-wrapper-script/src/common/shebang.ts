import { ShebangLine } from '@idlebox/shebang-parse';

/**
 * 解析目标文件的 shebang 行，返回要调用的解析器名称或路径
 */
export function shebangParse(firstLine: string) {
	const s = new ShebangLine(firstLine);
	if (s.isEnv) {
		const result = s.split();
		if (result.spliting) {
			return result.command[0];
		} else {
			return result.command;
		}
	} else {
		return s.command;
	}
}
