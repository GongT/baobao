const list: {
	message: string;
	isWarn: boolean;
	todo: string;
}[] = [];

export function addDiagnosis(message: string, todo: string = '', isWarn: boolean = false) {
	list.push({ message, isWarn, todo });
}

export function getAllDiagnosis() {
	return list;
}

export function diagnosisMessage() {
	const warns = list.filter(({ isWarn }) => isWarn).length;
	const errors = list.length - warns;

	return { warns, errors };
}
