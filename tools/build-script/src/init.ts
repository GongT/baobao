import initWorkspace from './api/initWorkspace';
import { PROJECT_ROOT } from './global';

export default function () {
	return initWorkspace(PROJECT_ROOT);
}
