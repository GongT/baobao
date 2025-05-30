import { customInspectSymbol } from '../tools/color.js';
import { isFlags, isRange, type IParamDesc } from '../tools/param-desc.js';
import { Conflict } from './errors.js';
import { Parameter } from './parameter.js';

// 新范围[desc.from, desc.to)，已有范围[from, to)
function isConflict(desc: { from: number; to: number }, exist_left: number, exists_right: number): boolean {
	// 如果新范围的结束小于等于已有范围的开始，或新范围的开始大于等于已有范围的结束，则不冲突
	// 否则冲突
	return !(desc.to <= exist_left || desc.from >= exists_right);
}

export class ParameterHolder {
	protected readonly parameters = new Map<string, Parameter>();
	private flags = new Map<string, Parameter>();
	private ranges = new Map<[number, number], Parameter>();
	private commands: Parameter[] = [];

	singleton(desc: IParamDesc): Parameter {
		const existing = this.parameters.get(desc.id);

		// 允许完全相同的重复调用
		if (existing) return existing;

		const created = new Parameter(desc);

		if (isFlags(desc)) {
			for (const name of desc.flags) {
				const conflict = this.flags.get(name);
				if (conflict) {
					throw new Conflict(conflict, created);
				}
			}
			this.flags.set(desc.id, created);
		} else if (isRange(desc)) {
			for (const [[left, right], existing] of this.ranges.entries()) {
				if (isConflict(desc, left, right)) {
					throw new Conflict(existing, created);
				}
			}
			this.ranges.set([desc.from, desc.to], created);
		} else {
			if (this.commands.length + 1 !== desc.level) {
				throw new TypeError(
					`can not create command at level ${desc.level}, because there are ${this.commands.length} levels.`,
				);
			}
			this.commands.push(created);
		}

		this.parameters.set(desc.id, created);
		return created;
	}

	[customInspectSymbol]() {
		return {
			flags: [...this.flags.values()],
			ranges: [...this.ranges.values()],
			commands: this.commands,
		};
	}
}
