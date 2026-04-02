<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### ProgramError

程序 bug 导致的异常的抽象基类，退出码为 `ExitCode.PROGRAM` (66)。

**类型:** `abstract class ProgramError extends ErrorWithCode`

---

##### NotImplementedError

功能未实现错误。

**类型:** `class NotImplementedError extends ProgramError`

---

##### SoftwareDefectError

软件缺陷错误，继承自 `ProgramError`。

**类型:** `class SoftwareDefectError extends ProgramError`

---

##### Assertion

提供静态断言方法的类。

**类型:** `class Assertion extends SoftwareDefectError`

**静态方法:**
- `Assertion.ok(value, message?, opts?)` — 断言 `value` 为真值，否则抛出 `SoftwareDefectError`

---

##### VariableTypeError

变量类型错误，继承自 `TypeErrorWithCode`。

**类型:** `class VariableTypeError extends TypeErrorWithCode`

构造函数: `constructor(object: any, opts?: { Expected?, variableName?, ...IErrorOptions })`

---

##### InvalidStateError

无效状态错误，继承自 `ProgramError`。

**类型:** `class InvalidStateError extends ProgramError`
