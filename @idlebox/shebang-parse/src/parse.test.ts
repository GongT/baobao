import { describe, expect, it } from 'vitest';
import { ShebangLine } from './parse.js';

describe('ShebangLine', () => {
	it('should parse a simple shebang line', () => {
		const p = new ShebangLine('#!/usr/bin/env node');
		expect(p.command).toBe('/usr/bin/env');
		expect(p.argument).toBe('node');
		expect(p.isEnv).toBe(true);
		expect(p.isSpliting).toBe(false);
		expect(() => p.split()).not.toThrow();
	});

	it('should parse a shebang line with env split string', () => {
		const p = new ShebangLine('#!  /usr/bin/env   -S   node   --harmony  ');
		expect(p.command).toBe('/usr/bin/env');
		expect(p.argument).toBe('-S   node   --harmony');
		expect(p.isEnv).toBe(true);
		expect(p.isSpliting).toBe(true);
		expect(p.split()).toEqual({
			spliting: true,
			opts: ['-S'],
			command: ['node', '--harmony'],
		});
	});

	it('should parse a shebang line with no env', () => {
		const p = new ShebangLine('#!/bin/bash -him');
		expect(p.command).toBe('/bin/bash');
		expect(p.argument).toBe('-him');
		expect(p.isEnv).toBe(false);
		expect(p.isSpliting).toBe(false);
		expect(() => p.split()).toThrow();
	});

	it('should have undefined argument for shebang line with only command', () => {
		const p = new ShebangLine('#!/bin/bash');
		expect(p.command).toBe('/bin/bash');
		expect(p.argument).toBeUndefined();
		expect(p.isEnv).toBe(false);
		expect(p.isSpliting).toBe(false);
		expect(() => p.split()).toThrow();
	});
});
