# yet another argument parser

究极简单的命令行参数解析器，只解析，没有其他功能，例如这些：

-   类型转换
-   限制参数必须存在
-   检查参数值是否合法

除了主类型外，还提供几个帮助函数：

-   从定义对象生成带有类型的参数解析结果
-   从定义对象生成帮助信息
-   向stderr渲染带颜色的人类友好输出

## 功能

### 别名:

注意: 不允许参数中同时使用同一个别名的多个版本（长短可以各用一个）

```typescript
const args = new ArgsReader(['--long=v1', '-s=v2']);
args.multiple(['--long', '--back-compat', '-s']); // -> ['v1', 'v2']

const args = new ArgsReader(['--long=v1', '--back-compat=v2']);
args.multiple(['--long', '--back-compat', '-s']); // throw!
```

### 合并、分离值:

```typescript
const args = new ArgsReader(['--long=--value1', '--long', 'value2', ' -s=value3']);

args.multiple(['--long', '-s']); // -> ['--value1', 'value2', 'value3']
```

### flag

```typescript
const args = new ArgsReader(['--x', '--flag2', '-xxa=value3', '--not-a-flag=']);

args.flag(['--x', '-x']); // -> 3
args.flag('--flag2'); // -> 1
args.flag('--flag3'); // -> 0

args.flag('--not-a-flag'); // throw!
args.single('--not-a-flag'); // -> ''
```

### 停止分析参数:

```typescript
const args = new ArgsReader(['-v=1', '--', '-v=2', '-xyz']);

args.multiple('-v'); // -> ['1']
args.at(0) === '-v=2';
args.at(1) === '-xyz';
```

### 禁止位置参数分散在命名参数之间:

所有位置参数必须在一起（但不要求在最末尾）

```typescript
const args = new ArgsReader(['-x', 'pos1', '-y=2', 'pos2']);
args.flag('-x'); // throw!

const args = new ArgsReader(['-x', 'pos1', '-y=2']);
args.flag('-x'); // -> 1
```

### 读取剩余未定义参数:

```typescript
const args = new ArgsReader(['-v', '1']);
args.unused(); // -> ['-v', '1']
args.multiple('-v'); // -> ['1']
args.unused(); // -> []
```

### 所有方法可以反复调用:

```typescript
const args = new ArgsReader(['-v=1', '-m=2']);
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
```

### 子命令:

```typescript
const argv1 = ['clone', '--work-tree=/tmp/xxx', '--depth=5', 'https://xxxx', '--verbose'];
const argv2 = ['--work-tree=/tmp/xxx', '--depth=5', 'clone', 'https://xxxx', '--verbose'];
const args = new ArgsReader(argv1);

args.single(['--work-tree']); // -> '/tmp/xxx'

const subArgs = args.requireCommand(['clone', 'pull', 'push']);

subArgs.single(['--depth']); // -> '5'
subArgs.at(0); // -> 'https://xxxx'
subArgs.single(['--work-tree']); // -> '/tmp/xxx'

// 子命令没有.finish()方法

args.finish(); // throw! "--verbose" 没有用到
```

## API

[class ArgsReader](./src/interface.ts)
