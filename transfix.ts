import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import {
  freeToneLettersTonal,
  TonalSpellingTags,
} from '../taipa/src/tonal/tonalres';

const tla = tonalLemmatizationAnalyzer;

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const transfix = tla
      .morphAnalyze(data.toString().trim(), new TonalUncombiningForms([]))
      .map((it) => it.sounds)
      .map((it) => {
        if (freeToneLettersTonal.includes(it[it.length - 1].toString())) {
          return it[it.length - 1].toString();
        }
      });

    const withoutTransfix = tla
      .morphAnalyze(data.toString().trim(), new TonalUncombiningForms([]))
      .map((it) => it.sounds)
      .map((it) => {
        if (
          it[it.length - 1].name === TonalSpellingTags.checkedTone ||
          it[it.length - 1].name === TonalSpellingTags.freeTone
        ) {
          it.pop();
        }
        return it.map((it) => it.toString()).join('');
      });

    const uncombiningSeqs = tla
      .morphAnalyze(data.toString().trim(), new TonalUncombiningForms([]))
      .map((it) =>
        it
          .getForms()
          .map((it) => it.literal)
          .join(', ')
      )
      .filter((it) => it.length > 0);

    console.info(transfix.join('-'));
    console.info(withoutTransfix.join('-'));
    uncombiningSeqs.map((x) => console.info(x));
  }
});
