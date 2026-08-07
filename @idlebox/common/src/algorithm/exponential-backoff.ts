import { humanDate } from '../date/to-string.js';
import { sleep } from '../schedule/timeout.js';

/**
 * 指数退避算法配置选项
 */
interface IOptions {
	/** 初始等待时间（毫秒） */
	readonly initialDelay: number;
	/** 最大等待时间（毫秒） */
	readonly maxDelay: number;
	/** 指数乘数 */
	readonly multiplier: number;
	/** 抖动因子 (0 ~ 1)。例如 0.5 表示向上随机浮动 50% 不会向下抖 */
	readonly jitter: number;
	/** 首次失败立即重试 */
	readonly immediateFirstRetry: boolean;
}

const defaultsLocal: IOptions = {
	initialDelay: 50,
	maxDelay: 1000,
	multiplier: 2,
	jitter: 0,
	immediateFirstRetry: true,
};

const defaultsNetwork: IOptions = {
	initialDelay: 100,
	maxDelay: 10000,
	multiplier: 2,
	jitter: 0.1,
	immediateFirstRetry: false,
};

/**
 * 纯粹指数退避算法类
 * 不包含异步操作
 */
export class ExponentialBackoff {
	private readonly initialDelay: number;
	private readonly maxDelay: number;
	private readonly multiplier: number;
	private readonly jitter: number;
	private readonly immediateFirstRetry: boolean;

	/** 记录连续失败的次数 */
	private attempts: number = 0;

	constructor(options: Required<IOptions>) {
		this.initialDelay = options.initialDelay;
		this.maxDelay = options.maxDelay;
		this.multiplier = options.multiplier;
		this.jitter = options.jitter;
		this.immediateFirstRetry = options.immediateFirstRetry;

		if (this.initialDelay <= 0) throw new Error(`initialDelay必须大于0`);
		if (this.maxDelay <= 0) throw new Error(`maxDelay必须大于0`);
		if (this.multiplier <= 1) throw new Error(`multiplier必须大于1`);
		if (this.jitter < 0 || this.jitter > 1) throw new Error(`jitter必须在0~1之间`);
	}

	/**
	 * 默认值适用于本地操作:
	 * 初始延迟 50ms，最大延迟 1000ms，指数乘数 2，无抖动，首次失败立即重试
	 *
	 * @param options 可选的配置项，用于覆盖默认值
	 */
	static forLocal(options: Partial<IOptions> = {}): ExponentialBackoff {
		return new ExponentialBackoff({ ...defaultsLocal, ...options });
	}

	/**
	 * 默认值适用于网络操作:
	 * 初始延迟 100ms，最大延迟 10000ms，指数乘数 2，抖动 0.1，首次失败不立即重试
	 *
	 * @param options 可选的配置项，用于覆盖默认值
	 */
	static forNetwork(options: Partial<IOptions> = {}): ExponentialBackoff {
		return new ExponentialBackoff({ ...defaultsNetwork, ...options });
	}

	/**
	 * 重置退避状态（通常在操作成功时调用）
	 */
	reset(): void {
		this.attempts = 0;
	}

	/**
	 * 记录一次失败，并返回当前应该等待的毫秒数
	 */
	next(): number {
		const r = this.calc();
		this.attempts++;
		return r;
	}

	private calc() {
		// 首次失败直接返回 0，不进行等待
		if (this.immediateFirstRetry && this.attempts === 0) {
			return 0;
		}

		// 如果第一次立即重试了，则指数需要-1
		const exp: number = this.immediateFirstRetry ? this.attempts - 1 : this.attempts;

		let delay = this.initialDelay * this.multiplier ** exp;
		delay = Math.min(delay, this.maxDelay);

		if (this.jitter > 0) {
			// 应用抖动
			delay = delay + Math.random() * delay * this.jitter;
			delay = Math.min(delay, this.maxDelay);
		}

		return Math.round(delay);
	}

	/**
	 * 调用 failed() 并返回一个 timeout Promise
	 */
	sleep() {
		return sleep(this.next());
	}

	[Symbol.toStringTag]() {
		return `[ExponentialBackoff ${JSON.stringify(this)}]`;
	}

	explainParameters() {
		let r = ``;
		if (this.immediateFirstRetry) {
			r += `首次失败立即重试, 再次从${humanDate.deltaTiny(this.initialDelay)}开始, `;
		} else {
			r += `首次失败等待${humanDate.deltaTiny(this.initialDelay)}, `;
		}

		r += `随后每次增加${this.multiplier}倍, 最大不超过${humanDate.deltaTiny(this.maxDelay)}, 预计约${Math.ceil(Math.log(this.maxDelay / this.initialDelay) / Math.log(this.multiplier))}次后达到最大值. `;

		if (this.jitter > 0) {
			r += `随机上浮${Math.round(this.jitter * 100)}%, 浮动范围为 [${humanDate.deltaTiny(this.initialDelay * this.jitter)} - ${humanDate.deltaTiny(this.maxDelay * this.jitter)}].`;
		} else {
			r += `无随机抖动.`;
		}
		return r;
	}

	explainStatus() {
		let r = `当前失败次数: ${this.attempts}`;
		if (this.attempts > 0) {
			r += `, 应等待: ${humanDate.deltaTiny(this.calc())}.`;
		} else {
			r += `.`;
		}
		return r;
	}
}
