import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
import {
  analyzeIntoSequence,
  getLetterSoundPairsSequential,
} from '../taipa/src/util';
import {
  TonalLetterTags,
  TonalSpellingTags,
} from '../taipa/src/tonal/tonalres';

import * as fs from 'fs';

/**
 * bopomofo
 *
 * > node path/to/bpmf.js
 */

const stdin = process.openStdin();

if (process.argv.length == 3) {
  if (!fs.existsSync(process.argv[2])) {
    console.log('File not found');
  }
}

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    analyzeIntoSequence(data.toString()).forEach((v) => {
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
      const ltrSndPairs = analyzeIntoSequence(input);

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
              arrPairs[idx - 1][0] === TonalLetterTags.c &&
              pair[1] === TonalSpellingTags.vowel &&
              pair[0] === TonalLetterTags.i
            ) {
              // in case of ci
              bpmf.pop(); // pop c
              bpmf.push(dict[TonalLetterTags.c + TonalLetterTags.i][0]);
              bpmf.push(arrEntry[0]); // push ci
            } else if (
              idx > 0 &&
              arrPairs[idx - 1][1] === TonalSpellingTags.initialConsonant &&
              arrPairs[idx - 1][0] === TonalLetterTags.ch &&
              pair[1] === TonalSpellingTags.vowel &&
              pair[0] === TonalLetterTags.i
            ) {
              // in case of chi
              bpmf.pop(); // pop ch
              bpmf.push(dict[TonalLetterTags.ch + TonalLetterTags.i][0]);
              bpmf.push(arrEntry[0]); // push chi
            } else if (
              idx > 0 &&
              arrPairs[idx - 1][1] === TonalSpellingTags.initialConsonant &&
              arrPairs[idx - 1][0] === TonalLetterTags.s &&
              pair[1] === TonalSpellingTags.vowel &&
              pair[0] === TonalLetterTags.i
            ) {
              // in case of si
              bpmf.pop(); // pop s
              bpmf.push(dict[TonalLetterTags.s + TonalLetterTags.i][0]);
              bpmf.push(arrEntry[0]); // push si
            } else if (
              idx > 0 &&
              arrPairs[idx - 1][1] === TonalSpellingTags.initialConsonant &&
              arrPairs[idx - 1][0] === TonalLetterTags.j &&
              pair[1] === TonalSpellingTags.vowel &&
              pair[0] === TonalLetterTags.i
            ) {
              // in case of ji
              bpmf.pop(); // pop j
              bpmf.push(dict[TonalLetterTags.j + TonalLetterTags.i][0]);
              bpmf.push(arrEntry[0]); // push ji
            } else {
              bpmf.push(arrEntry[0]);
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
