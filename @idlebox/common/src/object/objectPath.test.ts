import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { ObjectPath } from './objectPath.js';

createRootLogger('object-checker');
logger.enable(EnableLogLevel.debug);

const objects = [
	{
		value: {
			a: 1,
			b: {
				x: 1,
			},
			c: {
				x: 1,
				y: 2,
			},
		},
	},
	{
		a: {
			b: {
				c: {
					d: 1,
				},
			},
		},
	},
];

const check1 = new ObjectPath(objects[1]);
if (check1.get(['a', 'b', 'c', 'd']) !== 1) {
	logger.fatal`get fail`;
} else {
	logger.success`get ok`;
}

logger.log`${check1.get(['a', 'b', 'c'])}`;

const check2 = new ObjectPath(objects[0]);

check2.set(['value', 'a'], 2);
check2.set(['value', 'b', 'x'], undefined);
check2.set(['value', 'c', 'x'], undefined);

logger.log`${objects[0]}`;
