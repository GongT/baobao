import { humanDate } from '@idlebox/common';

export function datetimeTag() {
	return `auto sync: ${humanDate.datetime(new Date())}`;
}
