## Locale rules

- Except for source code, all documentation, comments, descriptive text, and log output messages should be in Chinese. For content already written in English, it is recommended to translate it into Chinese.

- Only use end-of-line punctuation (periods, dot, etc.) in plain text (e.g., markdown). Do not use end-of-line punctuation in code files, including log messages, error messages.

- For colons ":", parentheses "()", semicolons ";", question marks "?", exclamation marks "!", and single quotes "'", always use English punctuation.

- For double quotes, use Chinese double quotes "“”" only in plain text, and use English double quotes '"' in code files.

- "in code files" means inside a file with a code extension (e.g., .ts, .js, .py, etc.) and code blocks in markdown. including comments in it.

## How to respond to code review

1. Should use Chinese.
2. Focus on reviewing cases where comments and README files have not been updated in sync with code changes.
3. TypeScript files should not import symbols from autoindex(.*) files.
