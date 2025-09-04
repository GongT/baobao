import {
	closableToDisposable,
	DeferredPromise,
	definePublicConstant,
	DuplicateDisposeAction,
	Emitter,
	EnhancedDisposable,
	ExtendableTimer,
	sleep,
	type EventRegister,
} from '@idlebox/common';

/**
 * TODO: need a logger
 */
const logger = console;

interface IRecorder {
	onDataAvailable: EventRegister<Uint8Array<ArrayBuffer>>;
	onFinished: EventRegister<void>;
	dispose(): void;
}

/**
 * TODO: 新api要求使用webworker 这里模拟worker
 */
export class RawPcmStreamNode extends EnhancedDisposable implements IRecorder {
	protected override duplicateDispose = DuplicateDisposeAction.Allow;

	private readonly _onDataAvailable = new Emitter<Uint8Array<ArrayBuffer>>();
	public readonly onDataAvailable = this._onDataAvailable.event;

	/**
	 * 由于AudioNode没有类似end的事件，只能用延迟模拟一个
	 */
	private readonly _onFinished = new Emitter<void>();
	public readonly onFinished = this._onFinished.event;

	/**
	 * 被要求结束后，只有连续没有收到音频，才真正触发 onFinished
	 * 这和决定录音何时结束无关
	 */
	private readonly willFinish: ExtendableTimer;

	private _node?: ScriptProcessorNode;

	constructor(
		private readonly audioContext: AudioContext,
		private readonly bitDepth = 16,
		private readonly latency = 150,
	) {
		super();

		this.willFinish = new ExtendableTimer(latency * 2);
		this.willFinish.onSchedule(() => {
			logger.debug('连续没有收到音频，录制正确结束');
			this._onFinished.fireNoError();
			this.dispose();
		});
		this.onPostDispose(() => {
			this._onFinished.dispose();
			if (this._node) {
				this._node.disconnect();
				this._node = undefined;
			}
			this.willFinish.cancel();
			this._onDataAvailable.dispose();
		});
	}

	get bufferSize() {
		return calculateBufferSize(this.latency, this.audioContext.sampleRate, 1, this.bitDepth);
	}

	private _getNode() {
		if (!this._node) {
			this._node = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
			logger.debug(`创建新的stream-node: buffer size = %s`, this.bufferSize);
		}

		this._node.onaudioprocess = (event) => {
			this.willFinish.renew();
			const rawPcmData = event.inputBuffer.getChannelData(0);
			logger.debug('~ script process data %s frames', event.inputBuffer.length);
			const buff = float32_sint16(rawPcmData);
			this._onDataAvailable.fireNoError(new Uint8Array(buff.buffer));
		};

		// 实际无用，但没有目标就不产生事件
		this._node.connect(this.audioContext.destination);

		return this._node;
	}

	connectFrom(source: AudioNode) {
		source.connect(this._getNode());
	}

	/**
	 * 外部不要调用
	 *
	 * 优雅结束
	 * @private
	 */
	shutdown() {
		logger.debug('即将结束录制过程');
		this.willFinish.start();
	}
}

export class RawPcmStreamRecorder extends EnhancedDisposable {
	protected override duplicateDispose = DuplicateDisposeAction.Allow;

	private readonly channels = 1;
	private readonly dfd = new DeferredPromise<void>();

	constructor(
		public readonly bitDepth = 16,
		public readonly sampleRate = 16000,
	) {
		super();
	}

	get context(): AudioContext {
		logger.debug('creating new audio context');
		const context = new AudioContext({ sampleRate: this.sampleRate });
		context.addEventListener('statechange', () => {
			if (context.state === 'closed' && !this.hasDisposed) {
				this.dispose();
			}
		});

		definePublicConstant(this, 'context', context);
		this._register(closableToDisposable(context));

		this.onBeforeDispose(() => {
			if (!this.dfd.settled) this.dfd.error(new Error('录制操作中断'));

			this.started = undefined;
			this.close_microphone(0);
		});

		return context;
	}

	private started?: Promise<RawPcmStreamNode>;

	/**
	 * 开始录音（可以重复调用，返回相同）
	 * stop之后不能重新start
	 */
	startRecording(latency: number = 150): Promise<IRecorder> {
		if (this.disposed || this.hasClosed) {
			throw new Error('recorder is already finished');
		}

		if (!this.started) {
			this.started = this._startRecording(latency);
		}
		return this.started;
	}

	private _microphone?: MediaStream;
	private _analyze?: AnalyserNode;
	private _recorder?: RawPcmStreamNode;
	async _startRecording(latency: number) {
		logger.debug('启动录音，缓冲 %sms', latency);
		const microphone = await navigator.mediaDevices
			.getUserMedia({
				video: false,
				audio: {
					sampleRate: this.sampleRate,
					channelCount: this.channels,
					sampleSize: this.bitDepth,
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
			})
			.catch((e: any) => {
				this.dfd.error(e);
				throw e;
			});
		const streamNode = this.context.createMediaStreamSource(microphone);

		for (const item of microphone.getAudioTracks()) {
			item.addEventListener('ended', () => {
				logger.warn('麦克风由于外部原因停止');
				this.close_microphone(0);
			});
		}

		this._microphone = microphone;

		const recorder = new RawPcmStreamNode(this.context, this.bitDepth, latency);
		this._recorder = recorder;
		recorder.connectFrom(streamNode);

		recorder.onFinished(() => {
			this.dfd.complete();
		});

		const analyze = this.context.createAnalyser();
		this._analyze = analyze;
		streamNode.connect(analyze);

		return recorder;
	}

	private caclculateVolume() {
		if (!this._analyze) return 0;
		const bufferLength = this._analyze.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		this._analyze.getByteFrequencyData(dataArray);

		let sum = 0;
		for (const amplitude of dataArray) {
			sum += amplitude * amplitude;
		}

		return Math.sqrt(sum / dataArray.length);
	}

	getPromise() {
		return this.dfd.p;
	}

	private hasClosed = false;
	private close_microphone(delay: number) {
		if (this.hasClosed) return;
		this.hasClosed = true;

		logger.debug('程序主动关闭麦克风 | 延迟 %sms', delay);
		sleep(delay).then(() => {
			if (this._microphone) {
				// 其实只有一个
				for (const item of this._microphone.getAudioTracks()) {
					item.stop();
					this._microphone.removeTrack(item);
				}
			}

			if (this._recorder) this._recorder.shutdown();
		});
	}

	async stopRecording() {
		const volume: number = this.caclculateVolume();

		// 不知道是否合适
		const delay = (1000 * volume) / 60;

		this.close_microphone(delay);

		return new Promise<void>((resolve, reject) => {
			if (!this._recorder) return resolve();

			this._recorder.onBeforeDispose(resolve);
			this._recorder.onBeforeDispose(() => reject(new Error('录制操作非正常中断')));
		});
	}
}

function calculateBufferSize(milliseconds: number, sampleRate: number, channels: number, bits: number): number {
	const rawSize = Math.floor((milliseconds / 1000) * sampleRate * channels * (bits / 8));
	// 返回大于rawSize的最接近的2的幂
	const near = 2 ** Math.ceil(Math.log2(rawSize));
	return Math.max(256, Math.min(16384, near));
}

function float32_sint16(input: Float32Array) {
	// 将Float32Array转换为Int16Array
	const output = new Int16Array(input.length);
	for (let i = 0; i < input.length; i++) {
		let s = input[i];
		s = Math.max(-1, Math.min(1, s));
		output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
	}
	return output;
}
