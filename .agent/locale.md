## Locale rules

- All documentation, comments, descriptive text, and log output messages should be in Chinese.
    - If you find any text you are editing is in English, translate it into Chinese. eg:    
    ```js
	function add(a, b) {
		// calculate the sum of a and b
		return a + b;
	}

	function subtract(a, b) {
		// calculate the difference of a and b
		return a - b;
	}
	```
	When you asked to "change add to multiply", you should do the following:
	```js
	function multiply(a, b) {
		// 计算 a 和 b 的乘积
		return a * b;
	}

	function subtract(a, b) {
		// calculate the difference of a and b
		return a - b;
	}
	```

- Only use end-of-line punctuation (periods, dot, etc.) in plain text (e.g., markdown). Do not use end-of-line punctuation in code files, including log messages, error messages.

- For colons ":", parentheses "()", semicolons ";", question marks "?", exclamation marks "!", and single quotes "'", always use English punctuation.

- For double quotes, use Chinese double quotes "“”" only in plain text, and use English double quotes '"' in code files.

- "in code files" means inside a file with a code extension (e.g., .ts, .js, .py, etc.) and code blocks in markdown. including comments in it.

## How to respond to code review

1. Should use Chinese.
2. Focus on reviewing cases where comments and README files have not been updated in sync with code changes.
3. TypeScript files should not import symbols from autoindex(.*) files.
