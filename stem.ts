import { lemmatize } from '../taipa/src/unchange/lemmatizer';

/**
 * > node path/to/stem.js
 */

const stdin = process.openStdin();

function getStem(literal: string, ending: string) {
  if (literal.length - ending.length != 0) {
    return literal.substring(0, literal.length - ending.length);
  }
  return '';
}

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const lxLemma = lemmatize(data.toString().trim());
    const stem = getStem(lxLemma.word.literal, lxLemma.getInflectionalEnding());
    console.info('stem: ' + stem);

    console.info('desinence: ' + lxLemma.getInflectionalEnding());
  }
});
