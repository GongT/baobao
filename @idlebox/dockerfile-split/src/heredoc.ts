const hereDocStartReg = /<<-?\s*(['"])(\w+)(['"])/g;

export class HeredocWaitter {
	private waittingHereDocs = new Set<string>();

	handle(line: string) {
		line = line.trim();

		// 检查当前行是否是 heredoc 的结束标记
		if (this.waittingHereDocs.has(line)) {
			this.waittingHereDocs.delete(line);
		}

		// 检查指令是否包含 heredoc 起始标记
		for (const m of [...line.matchAll(hereDocStartReg)]) {
			const delimiter = m[2];
			this.waittingHereDocs.add(delimiter);
		}
		return this.waittingHereDocs.size > 0;
	}

	get active() {
		return this.waittingHereDocs.size > 0;
	}
}
