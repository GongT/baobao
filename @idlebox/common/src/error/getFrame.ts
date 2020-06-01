export function getErrorFrame(e: Error, frame: number): string;

export function getErrorFrame(e: Error, frame: number): string {
	if (e && e.stack) {
		const stackArr = e.stack.split('\n');
		if (stackArr.length > frame + 1) {
			return stackArr[frame + 1].trim();
		}
	}
	return '';
}
