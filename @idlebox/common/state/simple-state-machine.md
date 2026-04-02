<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### SimpleStateMachine

简单状态机，基于规则映射驱动状态转移，状态变化时触发事件。

**类型:** `class SimpleStateMachine<StateType, EventType>`

构造函数: `constructor(rules: ISsmRuleMap<StateType, EventType>, init_state: StateType)`

- `rules` — 状态转移规则，类型为 `Map<StateType, Map<EventType, StateType>>`
- `init_state` — 初始状态 (必须在规则中存在)

成员:

| 成员 | 说明 |
|---|---|
| `getName()` | 返回当前状态 |
| `change(event)` | 触发事件，若事件或当前状态不在规则中则抛出错误 |
| `onStateChange` | `EventRegister<IStateChangeEvent<StateType, EventType>>` |

`IStateChangeEvent` 包含 `from`、`to`、`reason` 字段。
