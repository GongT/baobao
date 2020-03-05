export function getErrorFrame(e: Error, frame: number) {
	return e.stack ? e.stack.split('\n')[frame + 1].trim() : '';
}
