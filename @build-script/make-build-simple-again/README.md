# Make Build Simple Again!!

### What is this?
This is a **extremely** simple build script, which can:
1. Run build command in dependency order
2. + in a pnpm monorepo (workspace)
3. + with typescript
4. + with watch support
5. WITHOUT ANY OTHER SHIT

You will take 100% control of your build process, as this script does not do anything except running the build command in the correct order.

### How to use it?
1. install it in your project: `pnpm -w add -D @build-script/make-build-simple-again` or globally `pnpm add -g @build-script/make-build-simple-again`
1. modify each `project.json`, add: 
   ```json
   "make-build-simple-again": {
	 "start": ["how to "]
   }
   ```
   or add a `build` script in `package.json` of each project.
1. run it `pnpm exec simple build [--watch|-w] [...only build projects]` 


### FAQ

**How to run multiple build steps?**
1. [npm-run-all](https://www.npmjs.com/package/npm-run-all) for simple
2. [gulp](https://gulpjs.com/) for complex
3. anything you want

**What to do if my builder does not support watch?**
* use [nodemon](https://nodemon.io/)

**What about webpack/vite/...?**
Just use them as you like!
