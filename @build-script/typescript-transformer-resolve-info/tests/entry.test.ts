import { ExpectedRecord, ImportType, testCase } from './test-lib/support';

testCase('library-type', 'import library type only', [
	new ExpectedRecord('fs-extra', {
		default: ImportType.TYPE,
		writeFile: ImportType.TYPE,
		Stats: ImportType.TYPE,
	}),
]);

testCase('library', 'import library with values', [
	new ExpectedRecord('fs-extra', {
		default: ImportType.VALUE,
		writeFile: ImportType.VALUE,
		WriteOptions: ImportType.TYPE,
	}),
]);

testCase('interface', 'import interface', [
	new ExpectedRecord('../decl/interface', {
		Interface: ImportType.TYPE,
		InterfaceWithClass: ImportType.TYPE,
	}),
]);

testCase('class', 'import classes', [
	new ExpectedRecord('../decl/interface', {
		Interface: ImportType.TYPE,
		InterfaceWithClass: ImportType.VALUE,
	}),
]);

testCase('side-effect', 'import side effect module', [new ExpectedRecord('source-map-support/register', {})]);

testCase('default-imports', 'import default', [
	new ExpectedRecord('../decl/function', {
		default: ImportType.VALUE,
	}),
]);

testCase('namespaces', 'import namespace', [
	new ExpectedRecord('../decl/manyValue', {
		'*': ImportType.VALUE,
	}),
	new ExpectedRecord('../decl/manyType', {
		'*': ImportType.TYPE,
	}),
]);
