import type { Terminal } from '../api.js';
import { CSI } from '../constants/sequence.js';

export class AlternativeScreen {
	private hasEnabled = false;
	constructor(private readonly terminal: Terminal) {}

	/**
	 * 启动备用缓冲区
	 * @param clear 切换后立刻清屏
	 */
	public enable(clear = false) {
		if (this.hasEnabled) return;
		process.stderr.write(`${CSI}?1049h`);
		if (clear) this.terminal.erase.all();
		this.hasEnabled = true;
	}

	/**
	 * 关闭备用缓冲区
	 * @param clear 先清空缓冲区再切回
	 */
	public disable(clear = false) {
		if (!this.hasEnabled) return;
		if (clear) this.terminal.erase.all();
		process.stderr.write(`${CSI}?1049l`);
		this.hasEnabled = false;
	}

	get enabled() {
		return this.hasEnabled;
	}

	dispose() {
		this.disable(true);
	}
}
