const descSymbol = Symbol('functionDescription');

export function description(func: any): string;
export function description(func: any, desc: string): void;
export function description(func: any, desc?: string) {
	if (desc) {
		func[descSymbol] = desc;
	} else {
		return func[descSymbol];
	}
}
