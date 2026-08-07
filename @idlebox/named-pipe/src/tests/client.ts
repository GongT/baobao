import { NamedPipe } from '../index.js';

const pipe = new NamedPipe('/tmp/test-pipe');

const stream = await pipe.write();

stream.on('close', () => {
	console.log('[测试] Stream closed');
});

stream.on('error', (err) => {
	console.error('[测试] Stream error:', err);
});

const data = process.argv.concat(['\n']).join(' ');
const buff = Buffer.from(data, 'utf-8');

stream.write(buff, () => {
	console.log('[测试] Data sent! (%s bytes)', buff.length);
});

let i = 0;
const timer = setInterval(() => {
	if (stream.writableNeedDrain) {
		console.log('[测试] Stream is full, waiting for drain...');
		return;
	}

	++i;

	const date = new Date().toISOString();
	const buff = Buffer.from(`[${i}] ${date}\n`, 'utf-8');

	stream.write(buff, (e) => {
		if (e) {
			console.error('[测试] Send error:', e);
			clearInterval(timer);
		} else {
			console.log('[测试] Data sent! (%s bytes)', buff.length);
		}
	});
}, 1000);
