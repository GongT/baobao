import { createRootLogger, logger } from '@idlebox/logger';
import { registerNodejsExitHandler } from '@idlebox/node';

createRootLogger('codegen');
registerNodejsExitHandler(logger);

const { main } = await import('./main.js');

await main();
