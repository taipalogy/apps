# apps

applications of Taipa

## license

MIT

## development

If you don't have TypeScript installed, run the following command line to install TypeScript globally under your `~/.nvm`:

`> npm install -g typescript`

Run the following command line to install type definitions for node:

`npm i --save-dev @types/node`

or simply run the following command line to install it after you clone this repo from GitHub:

`npm install`

Run the following command line to compile your TypeScript code to JavaScript:

`tsc -m commonjs -t es2022 --outDir out myapp.ts`

Replace file name in the above commaond line with your implementation. For example:

`tsc -m commonjs -t es2022 --outDir out kana.ts`

Assuming you have your app `bpmf.ts` compiled to `bpmf.js` by runnng the command line:

`tsc -m commonjs -t es2022 --outDir out bpmf.ts`

, and you have your own dictionary stored at `../dictionaries/bopomofo.json`, you can run the following command line to lauch the app:

`node out/apps/bpmf.js ../dictionaries/bopomofo.json`
