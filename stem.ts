import { lemmatize } from '../taipa/src/unchange/lemmatizer';

/**
 * > node path/to/stem.js
 */

const stdin = process.openStdin();

function getStem(input: string) {
  const lxLemma = lemmatize(input);
  const literal = lxLemma.word.literal;
  const ending = lxLemma.getInflectionalEnding();
  if (literal.length - ending.length != 0) {
    return literal.substring(0, literal.length - ending.length);
  }
  return '';
}

function getDesinence(input: string) {
  const lxLemma = lemmatize(input);
  return lxLemma.getInflectionalEnding();
}

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const stem = getStem(data.toString().trim());
    console.info('stem: ' + stem);

    const desinence = getDesinence(data.toString().trim());
    console.info('desinence: ' + desinence);
  }
});
