import { Emitter } from '../lifecycle/event/event';

// type StateType = string | number;
// type EventType = string | number;

export type IFsmRuleMap<StateType, EventType> = MapLike<StateType, MapLike<EventType, StateType>>;

type MapLike<K, V> = Pick<Map<K, V>, 'get' | 'has' | 'keys'>;

export interface IStateChangeEvent<StateType, EventType> {
	from: StateType;
	to: StateType;
	reason: EventType;
}

export class SimpleStateMachine<StateType, EventType> {
	protected declare currentState: StateType;
	protected readonly rules: IFsmRuleMap<StateType, EventType>;

	private readonly _onStateChange = new Emitter<IStateChangeEvent<StateType, EventType>>();
	public readonly onStateChange = this._onStateChange.register;

	constructor(rules: IFsmRuleMap<StateType, EventType>, init_state: StateType) {
		this.rules = rules;
		this.moveTo(init_state);
	}

	protected moveTo(state: StateType) {
		if (!this.rules.has(state)) throw new Error(`missing state "${state}"`);

		this.currentState = state;
	}

	getName() {
		return this.currentState;
	}

	change(event: EventType) {
		const state = this.rules.get(this.currentState)!;
		const next = state.get(event);
		if (typeof next === 'undefined') {
			throw new Error(
				`no event "${event} (${typeof event})" on state "${this.currentState} (${typeof this
					.currentState})" (has ${[...state.keys()].map((v) => `"${v} (${typeof v})"`).join(', ')})`
			);
		}

		const last = this.currentState;
		this.moveTo(next);
		this._onStateChange.fireNoError({ from: last, to: next, reason: event });
	}
}
