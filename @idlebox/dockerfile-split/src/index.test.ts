import { describe, expect, it } from 'vitest';
import { DockerfileParser, DockerInstructions, type IComment, type IInstruction } from './index.js';

describe('DockerfileParser', () => {
	it('should parse single instruction', () => {
		const result = new DockerfileParser().parse(`FROM alpine`);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'instruction',
			cmd: 'FROM',
			lines: 'FROM alpine',
		});
	});

	it('format instruction command', () => {
		const result = new DockerfileParser().parse(`  RuN   some   command  `);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'instruction',
			cmd: 'RUN',
			lines: 'RUN some   command',
		});
	});

	it('should parse multiple instructions', () => {
		const result = new DockerfileParser().parse(`FROM alpine\n#comment\nRUN echo hello`);
		expect(result).toHaveLength(3);
		expect(result[0]).toMatchObject({
			type: 'instruction',
			cmd: 'FROM',
			lines: 'FROM alpine',
		});
		expect(result[1]).toMatchObject({
			type: 'comment',
			lines: '#comment',
		});
		expect(result[2]).toMatchObject({
			type: 'instruction',
			cmd: 'RUN',
			lines: 'RUN echo hello',
		});
	});

	it('should works well', () => {
		const result = new DockerfileParser().parse(`
# 头部注释
FROM alpine:latest aS builder

# 中间注释
RUN echo hello

FROM builder as runner

RUN forget slash
 && but readed

CMD ["sh"]
`);

		let i = 0;
		const next = (m: Omit<IComment | IInstruction, 'lineno'>) => {
			expect(result[i++]).toMatchObject(m);
		};

		const comment = (lines: string) => ({ type: 'comment', lines }) as const;
		const instruction = (cmd: string, lines: string) => ({ type: 'instruction', cmd, lines }) as const;

		next(comment('\n# 头部注释'));
		next(instruction('FROM', 'FROM alpine:latest aS builder'));
		next(comment('\n# 中间注释'));
		next(instruction('RUN', 'RUN echo hello'));
		next(comment(''));
		next(instruction('FROM', 'FROM builder as runner'));
		next(comment(''));
		next(instruction('RUN', 'RUN forget slash\n && but readed'));
		next(comment(''));
		next(instruction('CMD', 'CMD ["sh"]'));
		expect(result).toHaveLength(i + 1);
	});

	it('should parse custom instructions', () => {
		const parser = new DockerfileParser(['MYINSTR', ...DockerInstructions]);
		const result = parser.parse(`MYiNStR some arguments`);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: 'instruction',
			cmd: 'MYINSTR',
			lines: 'MYINSTR some arguments',
		});
	});
});
