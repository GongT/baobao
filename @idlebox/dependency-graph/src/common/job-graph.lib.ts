export class UnrecoverableJobError extends Error {}

export enum JobState {
	NotStarted = 'not-start',
	Running = 'running',
	Error = 'error',
	Success = 'success',
	ErrorExited = 'error-exited',
	SuccessExited = 'success-exited',
}
