import { TonalStandaloneForms } from '../taipa/src/unchange/metaplasm';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import {
  freeToneLettersTonal,
  TonalSpellingTags,
} from '../taipa/src/tonal/tonalres';
import { analyzeIntoSyllables } from '../taipa/src/util';
import * as fs from 'fs';

const tla = tonalLemmatizationAnalyzer;

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const transfix = tla
      .morphAnalyze(data.toString().trim(), new TonalStandaloneForms([]))
      .map((it) => it.sounds)
      .map((it) => {
        if (freeToneLettersTonal.includes(it[it.length - 1].toString())) {
          return it[it.length - 1].toString();
        }
      });

    const withoutTransfix = tla
      .morphAnalyze(data.toString().trim(), new TonalStandaloneForms([]))
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

    const standaloneSeqs = tla
      .morphAnalyze(data.toString().trim(), new TonalStandaloneForms([]))
      .map((it) =>
        it
          .getForms()
          .map((it) => it.literal)
          .join(', ')
      )
      .filter((it) => it.length > 0);

    console.info(transfix.join('-'));
    console.info(withoutTransfix.join('-'));
    standaloneSeqs.map((x) => console.info(x));
  } else if (process.argv.length == 3) {
    const fileContents = fs.readFileSync(process.argv[2], 'utf-8');
    const dict: string[] = JSON.parse(fileContents) || [];
    const keys = Object.keys(dict);

    const result: string[] = [];
    analyzeIntoSyllables(data.toString().trim()).forEach((pairs) =>
      result.push(
        pairs
          .map((pair) =>
            pair[1] !== TonalSpellingTags.checkedTone &&
            pair[1] !== TonalSpellingTags.freeTone
              ? pair[0]
              : ''
          )
          .join('')
      )
    );

    console.log(result);
  }
});
