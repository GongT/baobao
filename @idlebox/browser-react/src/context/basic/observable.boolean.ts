import { Emitter } from '@idlebox/common';
import { useLastEvent } from '../../hook/use-emitter.js';

export class ObservableBoolean {
	private _value: boolean;
	private readonly _onChange = new Emitter<boolean>(`observable-boolean:change`);
	public readonly onChange = this._onChange.event;

	constructor(initial: boolean) {
		this._value = initial;
	}

	public get value() {
		return this._value;
	}

	public set value(v: boolean) {
		if (this._value !== v) {
			console.log('update value', v, this._onChange.listenerCount());
			this._value = v;
			this._onChange.fireNoError(v);
		}
	}

	reactive() {
		return useLastEvent(this.onChange, this._value);
	}
}
