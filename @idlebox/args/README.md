# yet another argument parser

究极简单的命令行参数解析器，只解析，没有其他功能，例如这些：

-   类型转换
-   限制参数必须存在
-   检查参数值是否合法

## 功能

### 有值参数:

```typescript
const args = createArgsReader(['--long=value', '-s=short', '--long', 'l', '--short', 's', '--one', '--two=2']);
args.single(['--long', '-s']); // throw!
args.multi(['--long', '-s']); // -> 'value', 'short', 'l', 's'

args.single('--one'); // -> ''
args.multi('--two'); // -> ['2']

```

### flag参数:

```typescript
// flag是计数器
const args = createArgsReader(['-x', '-xxy=value', '--long', '--no-long', '--no-long']);

args.flag('-x'); // -> 3
args.flag('--not-exists'); // -> 0
args.flag('--long'); // -> -1

// flag不能有值
const args = createArgsReader(['--flag1=value', '--flag2=']);
args.flag('--flag1'); // throw!
args.flag('--flag2'); // throw!

// 不用等号可能存在歧义，影响后续对value的判断
const args = createArgsReader(['--ambiguity', 'value']);
args.single('--ambiguity'); // -> 'value'
args.unused(); // -> []
// ... or ...
args.flag('--ambiguity'); // -> 1
args.unused(); // -> ['value']
```

### 位置参数:

```typescript
// 可以获取一个
const args = createArgsReader(['-v=1', 'value1', '--option', 'value2', '--', 'value3']);
args.at(0); // -> 'value1'
args.at(1); // -> 'value2'
args.at(2); // -> 'value3'
args.unused(); // -> ['-v=1', '--option']
args.single('--option'); // throw!

// 可以获取多个
const args = createArgsReader(['1', '2', '3', '4']);
args.range(1, 2); // -> ['2', '3']

// ending默认为结尾
args.range(3); // -> ['4']

// 超出范围返回undefined或空数组
args.at(999); // -> undefined
args.range(999); // -> []
```

### 别名:

```typescript
const args = createArgsReader(['--long=v1', '--back-compat=v2', '-s=v3']);
args.multiple(['--long', '--back-compat', '-s']); // -> ['v1', 'v2', 'v3']
```

### 合并、分离写法:

推荐始终使用合并的写法

```typescript
const args = createArgsReader(['--long=--value1', '--long', 'value2', '-s=value3']);

args.multiple(['--long', '-s']); // -> ['--value1', 'value2', 'value3']
```

### 停止分析参数:

双减号 `--` 用于停止分析参数，后面的参数都被视为位置参数，位置参数不能穿越 `--`, 因此当使用了 `--` 后，前面就不能出现位置参数了。

```typescript
const args = createArgsReader(['-v=1', 'value', '--', '-v=2', '--', '-xyz']);

args.multiple('-v'); // -> ['1']
args.at(0) === '-v=2';
args.at(1) === '--';
args.at(2) === '-xyz';
args.unused(); // -> ['value']
```

### 所有方法可以反复调用:

```typescript
const args = createArgsReader(['-v=1', '-m=2']);
args.at(0); // -> undefined
args.at(0); // -> undefined
args.single('-v'); // -> '1'
args.single('-v'); // -> '1'
args.finish();
args.finish();

// 注意: 每次调用同一个参数的方式必须一致
args.single('-v'); // -> '1'
args.multiple('-v'); // throw!
args.single(['-v']); // throw!

// 顺序也要一致
args.single(['-m', '--mm']);
args.single(['--mm', '-m']); // throw!


// 不同range也不能混用
// at(x) 实际是 range(x, 1) 的简写
args.at(2); // -> undefined
args.range(0); // throw!
```

### 读取剩余未使用的参数: （用于显示异常）

```typescript
const args = createArgsReader(['-v', '1']);
args.unused(); // -> ['-v', '1']
args.multiple('-v'); // -> ['1']
args.unused(); // -> []
```

### 子命令:

* 子命令是一个特殊的位置参数，可以和其他参数混在一起（当然不能在--后）
* flag不区分位置，子命令的flag也可以放在前面

```typescript
// argv1 和 argv2 使用的结果是完全相同的
const argv1 = ['clone', '--work-tree=/tmp/xxx', '--depth=5', 'https://xxxx', '--verbose'];
const argv2 = ['--work-tree=/tmp/xxx', '--depth=5', 'clone', 'https://xxxx', '--verbose'];
const args = createArgsReader(argv1);

args.single(['--work-tree']); // -> '/tmp/xxx'

const subArgs = args.requireCommand(['clone', 'pull', 'push']);

subArgs.single(['--depth']); // -> '5'
subArgs.at(0); // -> 'https://xxxx'
subArgs.single(['--work-tree']); // -> '/tmp/xxx'
```
