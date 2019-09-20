try {
	require.resolve('@idlebox/single-dog');
} catch (e) {
	console.error('Cannot resolve @idlebox/single-dog');
}

var commandExists = require('command-exists');

// invoked without a callback, it returns a promise
commandExists('ls')

