/**
 * wait read/write stream end/close, as promise
 * reject when stream emit error
 */
export function streamPromise(stream: NodeJS.ReadableStream | NodeJS.WritableStream): Promise<void> {
	if (streamHasEnd(stream)) {
		return Promise.resolve();
	} else {
		return new Promise((resolve, reject) => {
			const r = stream as NodeJS.EventEmitter;
			r.once('end', () => resolve());
			r.once('finish', () => resolve());
			r.once('close', () => resolve());
			r.once('error', reject);
		});
	}
}

export function streamHasEnd(S: NodeJS.ReadableStream | NodeJS.WritableStream) {
	const stream = S as any;
	return (
		(stream._writableState && stream._writableState.ended) || (stream._readableState && stream._readableState.ended)
	);
}
