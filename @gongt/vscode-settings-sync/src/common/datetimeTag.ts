import { humanDate } from '@idlebox/helpers';

export function datetimeTag() {
	return `auto sync: ${humanDate.datetime(new Date())}`;
}
