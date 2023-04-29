import { lemmatize } from '../taipa/src/unchange/lemmatizer';

/**
 * > node path/to/lemmatize.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const lxLemma = lemmatize(data.toString().trim());
    const lemmas = lxLemma.getLemmas().map((x) => x.literal);
    console.info('lemmas: ' + lemmas.map((x) => x).join(', '));
  }
});
