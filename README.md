# Apps

applications of Taipa

## License

MIT

## Development

If you don't have TypeScript installed, run the following command line to install TypeScript globally under your `~/.nvm`:

`npm install -g typescript`

Run the following command line to install type definitions for node:

`npm i --save-dev @types/node`

or simply run the following command line to install it after you clone this repo from GitHub:

`npm install`

You need the package.json file in the folder before you run `npm install`. You can run `npm init` or simply copy one from a repo to have it in place.

Run the following command line to compile your TypeScript code to JavaScript:

`tsc -m commonjs -t es2022 --outDir out myapp.ts`

Replace file name in the above commaond line with your implementation. For example:

`tsc -m commonjs -t es2022 --outDir out kana.ts`

Assuming you have your app `twbpmf.ts` compiled to `twbpmf.js` by runnng the command line:

`tsc -m commonjs -t es2022 --outDir out twbpmf.ts`

, and you have your own dictionary placed at `../dictionaries/bopomofo.json`, you can run the following command line to lauch the app:

`node out/apps/twbpmf.js ../dictionaries/twbpmf.json`

### kana

You can run the following command line to launch the kana application:

`node out/apps/kana.js`

You can then input Roman alphabet,

`katakana`

and hit the enter key, the app will then print the kanas. For example:

`かたかな`

and

`カタカナ`

will be printed on the screen.

### twbpmf

When you have your own dictionary available, you can implement an app to spell your word.

Assuming you have a dictionary placed at

`../dictionaries/twbpmf.json`.

You can run the following command line to lauch the app:

`node out/apps/twbpmf.js ../dictionaries/twbpmf.json`

Enter Roman letters on your keyboard and get the bopomofo in return. Enter

`ka`

and get

`ㄍㄚ`

### transliterate from Hangul

Run the following command to compile transliterate.ts to js:

`tsc -m commonjs -t es2022 --outDir out transliterate.ts`

Use the `fromHangul.json` file as a dictionary, you can transliterate Hangul:

`node out/apps/transliterate.js ../dictionaries/fromHangul.json`

### twkana

Assuming you have your app `twkana.ts` compiled to `twkana.js` by runnng the command line:

`tsc -m commonjs -t es2022 --outDir out twkana.ts`

And assuming you have a dictionary placed at

`../dictionaries/twkana.json`.

You can run the following command line to lauch the app:

`node out/apps/twkana.js ../dictionaries/twkana.json`

When you have an additional dictionary available, run then following command line to lauch the app:

`node out/apps/twkana.js ../dictionaries/mix.json`

Enter Roman letters on your keyboard and get the bopomofo in return. Enter

`ka`

and get

`カ`

## Dictionaries

Go to github repo `https://github.com/taipalogy/dictionaries` to find out more dictionary examples.
