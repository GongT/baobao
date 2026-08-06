process.setUncaughtExceptionCaptureCallback((error: unknown) => {
	let e: Error;
	if (error instanceof Error) {
		e = error;
	} else if (error) {
		e = error as any;
		if (!e.message) {
			e = new Error(String(error));
		}
	} else {
		e = new Error('Unknown error');
	}

	console.error(
		'\n\n%s|%s\n',
		process.env.PROTOCOL_MAGIC,
		JSON.stringify({
			type: 'uncaughtException',
			message: e.message,
			stack: e.stack,
		}),
	);
	process.exit(30);
});
