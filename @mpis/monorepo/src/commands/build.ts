import { logger } from '@idlebox/logger';
import { createMonorepoObject } from '../common/monorepo.js';

const repo = await createMonorepoObject();
await repo.startup();

logger.success('Monorepo started successfully');

repo.dump();
