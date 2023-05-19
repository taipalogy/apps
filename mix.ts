import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
import { getLetterSoundPairs } from '../taipa/src/util';
import {
  TonalLetterTags,
  TonalSpellingTags,
} from '../taipa/src/tonal/tonalres';

import * as fs from 'fs';

/**
 * > node path/to/mix.js
 */

const stdin = process.openStdin();

if (process.argv.length == 3) {
  if (!fs.existsSync(process.argv[2])) {
    console.log('File not found');
  }
}

function analyze(input: string) {
  const cli = new Client();
  const tla = tonalLemmatizationAnalyzer;
  const ta: TokenAnalysis = cli.processTonal(input.toString().trim());
  const wrd = ta.word as TonalWord; // type casting

  const pairs = getLetterSoundPairs(
    tla
      .morphAnalyze(wrd.literal, new TonalUncombiningForms([]))
      .map((x) => x.sounds)
  );

  return pairs;
}

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    analyze(data.toString()).forEach((v) => {
      console.info(v[0] + ' - ' + v[1]);
    });
  } else if (process.argv.length == 3) {
    if (!fs.existsSync(process.argv[2])) {
      console.log('File not found');
    } else {
      const input = data.toString().trim();
      const fileContents = fs.readFileSync(process.argv[2], 'utf-8');
      const dict: string[] = JSON.parse(fileContents) || [];
      const keys = Object.keys(dict);
      const ltrSndPairs = analyze(input);

      const bpmf: string[] = [];
      if (ltrSndPairs.length == 0) {
        for (const key of keys) {
          if (key === input) {
            const arr: [] = dict[key];
            const chrs = arr.join(',');
            // console.info(chrs);
            bpmf.push(chrs);
          }
        }
      } else {
        ltrSndPairs.forEach((pair: [string, string], idx, arrPairs) => {
          if (keys.includes(pair[0])) {
            const arrEntry: string[] = dict[pair[0]];
            if (
              pair[1] === TonalSpellingTags.stopFinalConsonant &&
              pair[0].length == 1
            ) {
              // the 4th tone
              bpmf.push(arrEntry[1]);
            } else if (
              idx > 0 &&
              arrPairs[idx - 1][1] === TonalSpellingTags.initialConsonant &&
              pair[1] === TonalSpellingTags.vowel
            ) {
              // console.log('idx:' + idx + '>' + arrPairs[idx - 1][0] + pair[0]);
              bpmf.pop(); // pop initial
              if (
                pair[0] === TonalLetterTags.a ||
                pair[0] === TonalLetterTags.i ||
                pair[0] === TonalLetterTags.u ||
                pair[0] === TonalLetterTags.o
              ) {
                // in case of a, i, u, o
                // push syllabogram
                bpmf.push(dict[arrPairs[idx - 1][0] + pair[0]][0]);
                // bpmf.push(arrEntry[0]);
              } else if (pair[0] === TonalLetterTags.e) {
                // in case of e
                const fnl = arrPairs.filter(
                  (it) =>
                    it[0] === TonalLetterTags.k &&
                    it[1] === TonalSpellingTags.stopFinalConsonant
                );
                if (fnl.length > 0) {
                  // in case of ~ek
                  // push pi, ti, ki, etc.
                  bpmf.push(dict[arrPairs[idx - 1][0] + TonalLetterTags.i][0]);
                  bpmf.push(arrEntry[1]); // push small kana e
                } else {
                  // in case of e
                  // push kana
                  bpmf.push(dict[arrPairs[idx - 1][0] + pair[0]][0]);
                }
              } else {
                // in case of ur, or, er, ir
                // push syllabogram
                bpmf.push(dict[arrPairs[idx - 1][0] + TonalLetterTags.o][0]);
                // push one more syllabogram
                // bc this letter is not one of a, i, u, e, o
                bpmf.push(arrEntry[1]); // push small kana
              }
            } else {
              if (
                idx > 1 &&
                arrPairs[0][1] === TonalSpellingTags.initialConsonant
              ) {
                // in case of leading kanas,
                // which means an initial and a leading vowel
                bpmf.push(arrEntry[1]); // push the small kana
              } else {
                bpmf.push(arrEntry[0]);
              }
            }
          } else if (pair[1] === TonalSpellingTags.nasalization) {
            // in case of nasalization

            // get vowels
            const vs: string[] = [];
            let i = idx - 1;
            while (i >= 0 && arrPairs[i][1] === TonalSpellingTags.vowel) {
              vs.unshift(arrPairs[i][0]);
              i--;
            }

            const vwls = vs.join('');
            const fldValue: string[] = dict[vwls + pair[0]] || [];
            if (fldValue.length == 0) {
              if (vwls.length == 2) {
                if (
                  (vwls[0] === TonalLetterTags.i &&
                    vwls[1] === TonalLetterTags.a) ||
                  (vwls[0] === TonalLetterTags.i &&
                    vwls[1] === TonalLetterTags.u) ||
                  (vwls[0] === TonalLetterTags.u &&
                    vwls[1] === TonalLetterTags.a)
                )
                  // in case of -iann, -iunn, -uann
                  fldValue.push(dict[vwls[1] + pair[0]][0] || '');
              } else if (vwls.length == 3) {
                if (
                  (vwls[vwls.length - 2] === TonalLetterTags.a &&
                    vwls[vwls.length - 1] === TonalLetterTags.i) ||
                  (vwls[vwls.length - 2] === TonalLetterTags.a &&
                    vwls[vwls.length - 1] === TonalLetterTags.u)
                )
                  // in case of -uainn, -iaunn
                  fldValue.push(
                    dict[
                      vwls[vwls.length - 2] + vwls[vwls.length - 1] + pair[0]
                    ][0] || ''
                  );
                bpmf.pop(); // pop a vowel
              }
            }

            // console.log('>' + vwls + '>' + pair[0] + '>' + fldValue);
            bpmf.pop(); // pop a vowel
            bpmf.push(fldValue[0]); // push nasalized vowels
          }
        });
      }

      console.info(bpmf.join(''));
    }
  }
});
