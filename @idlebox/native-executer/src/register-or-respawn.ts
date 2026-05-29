import debug from 'debug';
import { execaSync } from 'execa';
import { magic } from './tools/share.js';

const log = debug('executer');

if (Object.hasOwn(globalThis, Symbol.for('native-executer'))) {
	if (process.env.__RELAUNCH__) {
		// node无参数 -> 分支2 -> 当前
		log('执行器已经正确注册过（重启后）');

		delete process.env.__RELAUNCH__;

		if (process.execArgv.includes('--inspect')) {
			log('检测到默认调试参数，强制等待调试器连接');
			const ins = await import('node:inspector');
			ins.waitForDebugger();
		}
	} else {
		// node有参数 -> 当前
		log('执行器已经正确注册过');
	}
} else if (process.env.__RELAUNCH__ !== magic) {
	log('未发现magic，准备带参数重启进程');
	// node无参数 -> 当前
	const argv = process.argv.slice(1);

	const amaro = import.meta.resolve('./really-register.js');

	if (process.execve) {
		process.execve(process.execPath, ['--disable-warning=DEP0205', '--enable-source-maps', `--import=${amaro}`, ...argv], {
			...process.env,
			__RELAUNCH__: magic,
		});
	} else {
		const r = execaSync({
			reject: false,
			stdio: 'inherit', // TODO: 其他管道会因此失效
			env: {
				__RELAUNCH__: magic,
			},
		})`${process.execPath} --disable-warning=DEP0205 --enable-source-maps --import=${amaro} ${argv}`;
		if (r.exitCode) {
			process.exit(r.exitCode);
		} else if (r.signal) {
			process.kill(process.pid, r.signal);
		} else {
			process.exit(0);
		}
	}
	// 跳到1分支
} else {
	// 异常
	throw new Error('程序状态异常');
}
