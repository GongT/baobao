// export class BrowserOutput implements IAbstractConsole {
// public colorEnabled = true;

// private _incompleteLine = '';

// write(message: string): void {
// 	// message不含完整行
// 	if (!message.includes('\n')) {
// 		this._incompleteLine += message;
// 		return;
// 	}

// 	const lines = message.split('\n');

// 	if (this._incompleteLine) {
// 		lines[0] = this._incompleteLine + lines[0];
// 	}

// 	// 输出完整行，跳过最后一个不完整的行，如果message以换行结尾，则最后一个元素是空字符串
// 	for (let i = 0; i < lines.length - 1; i++) {
// 		writeLine(lines[i]);
// 	}

// 	// biome-ignore lint/style/noNonNullAssertion: lines必定还有且仅有一个元素
// 	this._incompleteLine = lines.at(-1)!;
// }
// }
