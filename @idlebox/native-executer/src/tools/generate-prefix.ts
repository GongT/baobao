process.setUncaughtExceptionCaptureCallback((error) => {
	console.error(
		'\n\n%s|%s\n',
		process.env.PROTOCOL_MAGIC,
		JSON.stringify({
			type: 'uncaughtException',
			message: error.message,
			stack: error.stack,
		}),
	);
	process.exit(30);
});
