# rollup-plugin-module-import-dew

**Note: `default export` is not for you, do not use it anymore! Named export instead.**

## Goal
Convert anything like this:
```javascript
import Button, {ButtonProps} from "some-library/button.js";
```
into:
```javascript
import { dew as _dew1 } from "some-library/button.dew.js";
const _dew1_default = _dew1().default;
const Button = _dew1_default;
const {ButtonProps} = _dew1_default;
```

## Why?
Because *"dew format can only imported by another module converted to dew format"*

You have two way to use `Button`:
1. `ReactDOM.render(<Button.default />, someDiv);` - this is simply invalid in TypeScript
1. compile to commonjs and then convert to dew format - use `babel-plugin-transform-cjs-dew`.
1. do some simple replace in module files - this package will do.

## Api
```typescript

```
