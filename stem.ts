import { lemmatize } from '../taipa/src/unchange/lemmatizer';

/**
 * > node path/to/stem.js
 */

const stdin = process.openStdin();

function getStems(literal: string, ending: string) {
  const l = literal;
  const ie = ending;
  const stems: string[] = [];
  if (l.length - ie.length != 0) {
    stems.push(l.substring(0, l.length - ie.length));
    return stems;
  }
  return stems;
}

function getInflectionalSuffixes(ending: string) {
  const desinences: string[] = [];
  if (ending) {
    desinences.push(ending);
    return desinences;
  }
  return desinences;
}

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const lxLemma = lemmatize(data.toString().trim());
    const stems = getStems(
      lxLemma.word.literal,
      lxLemma.getInflectionalEnding()
    );
    const inflectionalSuffixes = getInflectionalSuffixes(
      lxLemma.getInflectionalEnding()
    );
    stems.map((x) => console.info('stem:: ' + x));
    inflectionalSuffixes.map((x) => console.info('desinence: ' + x));
  }
});
