export abstract class LinesBuffer {
	protected lines: string[] = [];
	append(line: string): void {
		this.lines.push(line);
		this.after(line);
	}

	getLines(): readonly string[] {
		return this.lines;
	}

	clear() {
		this.lines.length = 0;
	}

	flush() {
		const result = this.lines.join('');
		this.lines.length = 0;
		return result;
	}

	protected abstract after(line: string): void;
}
export class ClearScreenHandler extends LinesBuffer {
	protected override after(line: string): void {
		if (line.includes('\x1Bc')) {
			this.lines.length = 0;
			const remaining = line.substring(line.lastIndexOf('\x1Bc') + 2);
			if (remaining) {
				this.lines[0] = remaining;
			}
		}
	}
}
