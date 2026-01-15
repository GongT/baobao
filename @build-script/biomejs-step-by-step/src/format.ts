import type { Diagnostic } from '@biomejs/js-api/nodejs';
import { execa } from 'execa';
import { resolve } from 'node:path';
import { inspect } from 'node:util';

function line_col(text: string, charAt: undefined | number) {
	if (typeof charAt !== 'number' || charAt < 0) {
		return { line: 1, col: 0 };
	}
	let line = 1;
	let col = 0;
	for (let i = 0; i < charAt; i++) {
		if (text[i] === '\n') {
			line++;
			col = 0;
		} else {
			col++;
		}
	}
	return { line, col };
}

export function printDiagnostic(d: Diagnostic, workingDir: string, file: string) {
	const location = d.location;
	const filepath = typeof location.path === 'object' ? resolve(workingDir, location.path.file) : file;
	const position = line_col(d.location.sourceCode || '', location.span?.[0]);
	const pathStr = `${filepath}:${position.line}:${position.col}`;

	console.log(`文件: ${pathStr}`);
	console.log('');
	console.log('\x1B[48;5;14m %s \x1B[0m -- \x1B[1m%s\x1B[0m -- %s\n', d.severity.toUpperCase(), d.category || 'unknown', d.description);
	const advs = d.advices.advices;

	for (const adv of advs) {
		printAdvice(adv);
	}
	console.log('');

	openFile(filepath, position);
}

/*
type Advice =
	| { log: [LogCategory, MarkupBuf] }
	| { list: MarkupBuf[] }
	| { frame: Location }
	| { diff: TextEdit }
	| { backtrace: [MarkupBuf, Backtrace] }
	| { command: string }
	| { group: [MarkupBuf, Advices] };
	*/

function printAdvice({ log, list, frame, diff, backtrace, command, group }: any) {
	if (log) {
		const [level, message] = log as string[];
		const color = { info: '38;5;14', warn: '38;5;11', error: '38;5;9', none: '2' }[level];
		console.log('\x1B[%sm[%s] %s\x1B[0m', color, level, stringifyMarkupBuf(message));
	} else if (diff) {
		const { dictionary, ops } = diff;
		const marks = new Map<number, string>();
		let text = dictionary;
		for (const item of ops) {
			if (item.diffOp?.insert) {
				const range = item.diffOp.insert.range;
				marks.set(range[0], '\x1B[38;5;10m');
				marks.set(range[1], '\x1B[0m');
			} else if (item.diffOp?.delete) {
				const range = item.diffOp.delete.range;
				marks.set(range[0], '\x1B[38;5;9m');
				marks.set(range[1], '\x1B[0m');
			} else if (item.equalLines) {
				const last = Math.max(...marks.keys());
				const nextNewLine = text.indexOf('\n', last);
				text = text.slice(0, nextNewLine > 0 ? nextNewLine : last);
				break;
			}
		}
		for (const key of Array.from(marks.keys()).sort((n1, n2) => n2 - n1)) {
			text = text.slice(0, key) + marks.get(key) + text.slice(key);
		}
		console.log('\n%s\n', text);
	} else if (list) {
		console.log('[:list:] %s', inspect(list, { colors: true, depth: Infinity, breakLength: Infinity, compact: false, maxStringLength: 100 }));
	} else if (frame) {
		console.log('[:frame:] %s', inspect(frame, { colors: true, depth: Infinity, breakLength: Infinity, compact: false, maxStringLength: 100 }));
	} else if (backtrace) {
		console.log('[:backtrace:] %s', inspect(backtrace, { colors: true, depth: Infinity, breakLength: Infinity, compact: false, maxStringLength: 100 }));
	} else if (command) {
		console.log('[:command:] %s', command);
	} else if (group) {
		console.log('[:group:] %s', stringifyMarkupBuf(group[0]));
		for (const adv of group[1].advices) {
			printAdvice(adv);
		}
	}
}

function stringifyMarkupBuf(buf: any) {
	let r = '';
	for (const { content, elements: _ } of buf) {
		r += content;
	}
	return r;
}
function openFile(filepath: string, position: { line: number; col: number }) {
	if (process.env.TERM_PROGRAM === 'vscode') {
		const codeBin = process.env.TERM_PROGRAM_VERSION?.includes('-insider') ? 'code-insiders' : 'code';

		execa(codeBin, ['--goto', `${filepath}:${position.line}:${position.col}`], {
			stdio: ['ignore', 'inherit', 'inherit'],
			// verbose: 'short',
		}).catch((e) => {
			console.error('打开文件失败: ', e);
		});
	}
}
