interface ITextProps {
	value?: any;
	prefix?: string;
	suffix?: string;
	skipZero?: boolean;
	className?: string;
}

/**
 * 类似于 input readonly，但只用一个span
 * 目的是自定义样式
 */
export function FormTextField({ className, prefix, skipZero = false, suffix, value }: ITextProps) {
	// console.log('text:', value, skipZero);
	if (!value && skipZero) return;
	const r: string[] = [];
	if (prefix) r.push(prefix);
	if (value) r.push(`${value}`);
	if (suffix) r.push(suffix);
	return <span className={className}>{r}</span>;
}
