import { describe, expect, it } from 'vitest';
import { mpath } from './mpath.js';

describe('路径处理: posix', () => {
	it('should normalize slashes', () => {
		expect(mpath.posix.normalizeSlash('foo//bar/')).toBe('foo/bar/');
		expect(mpath.posix.normalizeSlash('foo/////bar')).toBe('foo/bar');
	});

	it('should identify root paths', () => {
		expect(mpath.posix.isRoot('/')).toBe(true);
		expect(mpath.posix.isRoot('/foo/..')).toBe(false);
		expect(mpath.posix.isRoot('/foo')).toBe(false);
	});

	it('should identify absolute paths', () => {
		expect(mpath.posix.isAbsolute('//foo')).toBe(true);
		expect(mpath.posix.isAbsolute('/foo/..')).toBe(true);
		expect(mpath.posix.isAbsolute('foo')).toBe(false);
	});

	it('should get the root of a path', () => {
		expect(mpath.posix.rootOf('/foo')).toBe('/');
		expect(mpath.posix.rootOf('/')).toBe('/');
	});

	it('should get the dirname of a path', () => {
		expect(mpath.posix.dirname('/foo/bar/')).toBe('/foo');
		expect(mpath.posix.dirname('/foo/bar/baz')).toBe('/foo/bar');
		expect(mpath.posix.dirname('/foo///')).toBe('/');
		expect(mpath.posix.dirname('///foo///bar///')).toBe('/foo');
		expect(mpath.posix.dirname('///')).toBe('/');
	});
});

describe('路径处理: win32', () => {
	it('should normalize slashes', () => {
		expect(mpath.win32.normalizeSlash('foo\\\\bar\\')).toBe('foo/bar/');
		expect(mpath.win32.normalizeSlash('foo\\\\\\\\\\bar')).toBe('foo/bar');
	});

	it('should split paths', () => {
		expect(mpath.win32.split('C:/Windows/System32/cmd.exe')).toEqual({
			root: 'C:/',
			path: 'Windows/System32/cmd.exe',
		});
		expect(mpath.win32.split('C:/')).toEqual({
			root: 'C:/',
			path: '',
		});
		expect(mpath.win32.split('\\\\server/share')).toEqual({
			root: '//server/share/',
			path: '',
		});
		expect(mpath.win32.split('\\\\server/share/folder')).toEqual({
			root: '//server/share/',
			path: 'folder',
		});
		expect(mpath.win32.split('//./c:/windows/system32')).toEqual({
			root: '//./c:/',
			path: 'windows/system32',
		});
	});

	it('should identify root paths', () => {
		expect(mpath.win32.isRoot('C:///')).toBe(true);
		expect(mpath.win32.isRoot('C:')).toBe(false);
		expect(mpath.win32.isRoot('C:/Windows')).toBe(false);
	});

	it('should identify UNC root paths', () => {
		expect(mpath.win32.isRoot('\\\\server/share')).toBe(true);
		expect(mpath.win32.isRoot('//server')).toBe(false);
		expect(mpath.win32.isRoot('//server/share/folder')).toBe(false);
	});

	it('should identify Unified root paths', () => {
		expect(mpath.win32.isRoot('\\\\.\\C:\\')).toBe(true);
		expect(mpath.win32.isRoot('//?/C:')).toBe(false);
		expect(mpath.win32.isRoot('\\\\?\\C:\\Windows')).toBe(false);

		expect(mpath.win32.isRoot('\\\\.\\Volume{12345678-1234-1234-1234-1234567890ab}\\')).toBe(true);
		expect(mpath.win32.isRoot('\\\\?\\Volume{12345678-1234-1234-1234-1234567890ab}')).toBe(false);

		expect(mpath.win32.isRoot('\\\\.\\unc\\server\\share\\')).toBe(true);
		expect(mpath.win32.isRoot('\\\\?\\UNC\\server\\share')).toBe(true);
		expect(mpath.win32.isRoot('\\\\?\\UNC\\server\\share\\folder')).toBe(false);
	});

	it('should identify absolute paths', () => {
		expect(mpath.win32.isAbsolute('C:/Windows')).toBe(true);
		expect(mpath.win32.isAbsolute('//server/share')).toBe(true);
		expect(mpath.win32.isAbsolute('Windows')).toBe(false);
	});

	it('should get the root of a path', () => {
		expect(mpath.win32.rootOf('C:/Windows')).toBe('C:/');
		expect(mpath.win32.rootOf('//server/share/path/to/file')).toBe('//server/share/');
	});

	it('should get the dirname of a path', () => {
		expect(mpath.win32.dirname('C:/Windows/System32')).toBe('C:/Windows');
		expect(mpath.win32.dirname('C:/Windows')).toBe('C:/');
		expect(mpath.win32.dirname('C:/')).toBe('C:/');
		expect(mpath.win32.dirname('//server/share/folder/file.txt')).toBe('//server/share/folder');
		expect(mpath.win32.dirname('//server/share/folder/')).toBe('//server/share/');
		expect(mpath.win32.dirname('//server/share')).toBe('//server/share/');
	});
});
