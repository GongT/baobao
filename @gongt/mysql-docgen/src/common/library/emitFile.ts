interface IEmit {
	(text: string): void;
}

export function createEmitter(writer: NodeJS.WritableStream, padding: string): IEmit {
	return (text: string) => {
		if (text.includes('\n')) {
			text = text.split(/[\n|\r]+/g).join('\n' + padding);
			return writer.write(padding + text + '\n');
		} else {
			return writer.write(padding + text + '\n');
		}
	};
}
