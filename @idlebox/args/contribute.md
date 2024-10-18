# 术语表

| name       | explain                                                       |
| ---------- | ------------------------------------------------------------- |
| param(s)   | a string element of `process.argv`                            |
| option     | a param must have value. *eg: `--env=X=y`, `--level verbose`* |
| flag       | a param must not have value. *eg: `--help`*                   |
| value      | a plain value param (not start with -). *eg: `verbose`*       |
| positional | a token not bound to an argument. *eg: `init .`*              |
| argument   | the combination of a definition and 0+ tokens                 |
| definition | one of `value[--xx]`/`flag[--xx]`/`position[start:end]`       |
| token      | a parsed param, with type `flag`/`value`/`both`               |
