<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### nextSecond / nextMinute / nextHour / nextDay / nextWeek / nextMonth / nextYear

对 `Date` 对象就地加减指定单位数量，并返回同一对象。

**共同签名:** `(d: Date, n?: number) => Date`

**参数:**
- `d` — 要修改的 Date 对象 (原地修改)
- `n` — 步数，默认为 `1`，可传负数表示向前

**示例:**
```typescript
const d = new Date('2024-01-01');
nextDay(d, 7); // d 变为 2024-01-08
nextMonth(d, -1); // d 变为 2023-12-08
```
