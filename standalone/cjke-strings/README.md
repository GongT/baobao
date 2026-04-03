[string-width](https://www.npmjs.com/package/string-width) is active maintenance again! Use that package instead.  
This package will mark as deprecated soon.

# CJKE strings module

Tools for **C**hinese **J**apanese **K**orean **E**moji string

The code is come from:

-   Write by myself
-   Codebase is copied from sindresorhus/string-width
-   Learn about emojis from tonytonyjan/string-width
-   Unicode tables copied from many wiki pages

Mostly you also need a module called `stringz`

```typescript
describe('typescript', () => {
	it('is really great', () => {
		should(cleverMan).to.be('using it');
	});
});
```

## APIs

-   isCombiningCharacters - detect a character is in Combining Characters table
-   readFirstCompleteChar - get first complete character at beginning of given string, prevent ￿ or ?
-   unicodeEscape - escape string as "\uxxxx\uxxxx\uxxxx" form
-   limitWidth - cut a limited display width of a string
-   stringWidth - calculate display width of a string

### readFirstCompleteChar(str: string, windowsConsole = false): CodePointInfo

| var            | desc                               |
| -------------- | ---------------------------------- |
| str            | any string                         |
| windowsConsole | is used for windows console or not |

**CodePointInfo**

| var     | type    | desc                       |
| ------- | ------- | -------------------------- |
| data    | string  | first complete char        |
| width   | number  | display width of that char |
| length  | number  | string length of that char |
| visible | boolean | should the char visible?   |

### function limitWidth(str: string, limit: number, windowsConsole = false): LimitResult

| var            | desc                               |
| -------------- | ---------------------------------- |
| str            | any string                         |
| limit          | target display width to cut        |
| windowsConsole | is used for windows console or not |

**LimitResult**

| var    | type   | desc                         |
| ------ | ------ | ---------------------------- |
| result | string | cut result                   |
| width  | number | real display width of result |

### function stringWidth(str: string, windowsConsole = false): number

| var            | desc                               |
| -------------- | ---------------------------------- |
| str            | any string                         |
| windowsConsole | is used for windows console or not |
| {return}       | the display width of str           |

### function isCombiningCharacters(code: number): boolean

| var      | desc                                    |
| -------- | --------------------------------------- |
| code     | return value of `'string'.charCodeAt()` |
| {return} | is in combine char list                 |

### function unicodeEscape(str: string): string

| var      | desc           |
| -------- | -------------- |
| str      | any string     |
| {return} | escaped string |

## Windows console

Windows Console (the black window) is not fully support unicode, so there is some workaround. Default is `false`.

| char | default | when true |
| :--: | ------: | --------: |
|  À   |       1 |         2 |
|  😂̀  |       2 |         3 |
|  À̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀̀   |       1 |        25 |
|  啊  |       2 |         2 |
|  👍🏽  |       2 |  4(👍+🏽) |
