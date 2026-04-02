<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### humanDate

日期/时间格式化工具集合 (namespace)。

**humanDate.time(date)**
格式化为 `HH:mm:ss`。参数可以是 `Date`、时间戳数字或数字字符串。

**humanDate.date(date, sp?)**
格式化为 `YYYY-MM-dd`。`sp` 参数为分隔符，默认 `'-'`。

**humanDate.datetime(date)**
格式化为 `YYYY-MM-dd HH:mm:ss`。

**humanDate.deltaTiny(ms) / humanDate.deltaTiny(from, to)**
将时间差 (ms) 格式化为最粗粒度的单位字符串，如 `'1d'`、`'3h'`。当 delta≤0 时返回 `'0s'`。最大单位为天。

**humanDate.delta(ms) / humanDate.delta(from, to)**
将时间差格式化为包含所有单位的字符串，如 `'1d10m42s'`。当 delta<1min 时才显示毫秒。当 delta≤0 时返回 `'0s'`。

**humanDate.setLocaleFormatter(formatter)**
设置各时间单位的格式化函数 (ms/s/m/h/d)，用于本地化输出。参数为 `Partial<IFormatters>`。
