import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
// import { getLetterSoundPairs } from '../taipa/src/util';
import {
  TonalLetterTags,
  TonalSpellingTags,
} from '../taipa/src/tonal/tonalres';
import { Sound } from '../taipa/src/unit';

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

export function getLetterSoundPairsSyllabic(
  soundSeqs: Sound[][]
): [string, string][][] {
  // return letter-sound-name pairs

  return soundSeqs.map((v) => {
    return v.map((v) => [v.toString(), v.name]);
  });
}

function analyze(input: string) {
  const cli = new Client();
  const tla = tonalLemmatizationAnalyzer;
  const ta: TokenAnalysis = cli.processTonal(input.toString().trim());
  const wrd = ta.word as TonalWord; // type casting

  const pairs = getLetterSoundPairsSyllabic(
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
      const syllables = analyze(input);

      const syllabograms: string[] = [];
      if (syllables.length == 0) {
        for (const key of keys) {
          if (key === input) {
            const arr: [] = dict[key];
            const chrs = arr.join(',');
            // console.info(chrs);
            syllabograms.push(chrs);
          }
        }
      } else {
        syllables.forEach((ltrSndPairs) =>
          ltrSndPairs.forEach((pair: [string, string], idx, arrPairs) => {
            const init = arrPairs.filter(
              (it) => it[1] === TonalSpellingTags.initialConsonant
            );
            const vwls = arrPairs.filter(
              (it) => it[1] === TonalSpellingTags.vowel
            );
            const mtrLctns = arrPairs.filter(
              (it) => it[1] === TonalSpellingTags.materLectionis
            );
            const nslFnl = arrPairs.filter(
              (it) => it[1] === TonalSpellingTags.nasalFinalConsonant
            );
            const nslztn = arrPairs.filter(
              (it) => it[1] === TonalSpellingTags.nasalization
            );
            const stpFnl = arrPairs.filter(
              (it) => it[1] === TonalSpellingTags.stopFinalConsonant
            );
            const tnl = arrPairs.filter(
              (it) =>
                it[1] === TonalSpellingTags.freeTone ||
                it[1] === TonalSpellingTags.checkedTone
            );

            if (keys.includes(pair[0])) {
              const fldValue: string[] = dict[pair[0]] || [];
              if (
                pair[1] === TonalSpellingTags.stopFinalConsonant
                //  && pair[0].length == 1
              ) {
                // the 4th tone
                if (
                  pair[0] !== TonalLetterTags.h &&
                  pair[0] !== TonalLetterTags.hh
                ) {
                  syllabograms.push(fldValue[1]);
                } else {
                  syllabograms.push(fldValue[2]);
                }
                // if (
                //   nslztn.length > 0 &&
                //   tnl.length == 0
                //   //  && pair[0].length == 1
                // ) {
                //   syllabograms.push(dict[TonalLetterTags.nn][2]);
                // }
              } else if (
                idx > 0 &&
                arrPairs[idx - 1][1] === TonalSpellingTags.initialConsonant &&
                pair[1] === TonalSpellingTags.vowel
              ) {
                // in case of preceding initial and vowel
                // console.log('idx:' + idx + '>' + arrPairs[idx - 1][0] + pair[0]);
                syllabograms.pop(); // pop initial
                if (
                  pair[0] === TonalLetterTags.a ||
                  pair[0] === TonalLetterTags.i ||
                  pair[0] === TonalLetterTags.u ||
                  pair[0] === TonalLetterTags.o
                ) {
                  // in case of a, i, u, o
                  // push syllabogram
                  syllabograms.push(dict[arrPairs[idx - 1][0] + pair[0]][0]);
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
                    syllabograms.push(
                      dict[arrPairs[idx - 1][0] + TonalLetterTags.i][0]
                    );
                    syllabograms.push(fldValue[1]); // push small kana e
                  } else {
                    // in case of e
                    // push kana
                    syllabograms.push(dict[arrPairs[idx - 1][0] + pair[0]][0]);
                  }
                } else {
                  // in case of ur, or, er, ir
                  // push syllabogram
                  syllabograms.push(
                    dict[arrPairs[idx - 1][0] + TonalLetterTags.o][0]
                  );
                  // push one more syllabogram
                  // bc this letter is not one of a, i, u, e, o
                  syllabograms.push(fldValue[1]); // push small kana
                }
              } else if (
                pair[1] === TonalSpellingTags.freeTone ||
                pair[1] === TonalSpellingTags.checkedTone
              ) {
                // in case of tone

                console.log('>' + pair);

                // in case of nasalization
                if (nslztn.length > 0)
                  syllabograms.push(fldValue[1]); // push nasalized tone mark
                else syllabograms.push(fldValue[0]);
              } else if (pair[1] === TonalSpellingTags.nasalization) {
                // in case of nasalization
                if (tnl.length == 0 && stpFnl.length == 0) {
                  // in case of no tone letters
                  syllabograms.push(fldValue[1]); // push nasalized tone mark
                }
              } else {
                if (
                  (idx > 1 &&
                    arrPairs[0][1] === TonalSpellingTags.initialConsonant) ||
                  (idx > 0 && arrPairs[0][1] === TonalSpellingTags.vowel)
                ) {
                  // in case of leading kanas,
                  // which means an initial followed by a leading vowel
                  // or a leading vowel

                  syllabograms.push(fldValue[1]); // push the small kana
                } else if (
                  init.length == 1 &&
                  vwls.length == 0 &&
                  nslFnl.length == 1
                ) {
                  // console.log('>' + fldValue);
                  // in case of sng, kng, mnghh, etc.
                  if (
                    fldValue.length > 0 &&
                    pair[1] === TonalSpellingTags.nasalFinalConsonant
                  )
                    syllabograms.push(fldValue[1]);
                  else if (
                    fldValue.length > 0 &&
                    pair[1] === TonalSpellingTags.initialConsonant
                  ) {
                    // in case of initial consonant
                    // push su for s, ku for k, etc.
                    syllabograms.push(dict[pair[0] + TonalLetterTags.u][0]);
                  }
                } else if (mtrLctns.length > 0) {
                  syllabograms.push(fldValue[0]);
                } else {
                  syllabograms.push(fldValue[0]);
                }
              }
            } else {
              // in case of initial consonant
              // in case of no matched field keys in json
              // in case of chu for chng, thng, khngw
              syllabograms.push(dict[pair[0] + TonalLetterTags.u][0]);
            }
          })
        );
      }

      console.info(syllabograms.join(''));
    }
  }
});