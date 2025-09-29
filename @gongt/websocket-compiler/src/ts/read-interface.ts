import { logger } from '@idlebox/cli';
import { SyntaxKind, type ClassDeclaration, type InterfaceDeclaration, type MethodDeclaration, type MethodSignature } from 'ts-morph';
import { walkExtendsWithSelf } from './analyze-export.js';

export interface IMethodInfo {
	arguments: [number, number];
	returnPromise: boolean;
	classDeclaration: ClassDeclaration | InterfaceDeclaration;
	methodDeclarations: (MethodSignature | MethodDeclaration)[];
}

export function readInterface(classDef: ClassDeclaration | InterfaceDeclaration, stopAt?: ClassDeclaration) {
	const metadata: Record<string, IMethodInfo> = {};
	for (const classDecl of walkExtendsWithSelf(classDef)) {
		if (classDecl === stopAt) break;

		logger.debug`分析类 ${classDecl.getName()}`;
		for (const method of classDecl.getMethods()) {
			if (method.isKind(SyntaxKind.MethodDeclaration) && method.getScope() !== 'public') continue;

			const name = method.getName();
			const exists = metadata[name];
			if (exists) {
				if (exists.classDeclaration === classDecl) {
					exists.methodDeclarations.push(method);
				}
				continue;
			}

			const methodInfo: IMethodInfo = {
				arguments: [0, 0],
				returnPromise: false,
				classDeclaration: classDecl,
				methodDeclarations: [method],
			};
			metadata[name] = methodInfo;
			logger.verbose`* 方法: ${name}`;
			for (const param of method.getParameters()) {
				methodInfo.arguments[0]++;
				if (param.isOptional()) {
					methodInfo.arguments[1]++;
				}
			}
			const returnType = method.getReturnType();
			if (returnType.getSymbol()?.getName() === 'Promise') {
				methodInfo.returnPromise = true;
			}
			logger.verbose`  - 参数: ${methodInfo.arguments[0]} 个，其中 ${methodInfo.arguments[1]} 个可选`;
			logger.verbose`  - 返回值: ${methodInfo.returnPromise ? 'Promise' : '非Promise'}`;
		}
	}
	return metadata;
}
