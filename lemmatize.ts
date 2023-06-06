import { getLemmas } from '../taipa/src/util';

/**
 * > node path/to/lemmatize.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    console.info('lemmas: ' + getLemmas(data.toString().trim()));
  }
});
