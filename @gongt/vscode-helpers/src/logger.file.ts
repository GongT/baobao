import { createWriteStream, WriteStream } from 'fs';
import { BaseLogger } from './logger';

export class VSCodeFileLogger extends BaseLogger {
	private declare stream: WriteStream;

	private constructor(file: string) {
		super();
		this.stream = createWriteStream(file, { flags: 'a' });
	}

	/** @internal */
	public static _create(file: string) {
		return new VSCodeFileLogger(file);
	}

	protected appendLine(line: string): void {
		this.stream.write(line + '\n');
	}

	dispose(): void | Promise<void> {
		return new Promise((resolve) => {
			this.stream.end(() => {
				resolve();
			});
		});
	}
}
