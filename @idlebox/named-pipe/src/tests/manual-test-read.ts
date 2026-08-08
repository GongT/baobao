import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import why from 'why-is-node-running';
import { NamedPipe } from '../index.js';

createRootLogger('', EnableLogLevel.verbose);

const pipe = new NamedPipe('/tmp/test-pipe', { logger: logger });

const stream = await pipe.read();

stream.on('data', (chunk) => {
	console.log('[测试] Received data:', chunk.toString());
});

stream.on('end', () => {
	console.log('[测试] Stream ended');
});

stream.on('error', (err) => {
	console.error('[测试] Stream error:', err);
});

let again = false;
process.on('SIGINT', async () => {
	console.error('\n收到SIGINT!');
	// await pipe.close();
	stream.destroy();
	// process.exit(0);

	if (again) {
		console.error('再次收到SIGINT，强制退出');
		process.exit(1);
	}
	again = true;

	const r = setTimeout(() => {
		why();
	}, 1000);
	r.unref();
});
