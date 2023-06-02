import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
import {
  getLetterSoundPairsSequential,
  getLetterSoundPairsSyllabic,
} from '../taipa/src/util';
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

function analyzeIntoSyllables(input: string) {
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

function analyzeIntoSequence(input: string) {
  const cli = new Client();
  const tla = tonalLemmatizationAnalyzer;
  const ta: TokenAnalysis = cli.processTonal(input.toString().trim());
  const wrd = ta.word as TonalWord; // type casting

  const pairs = getLetterSoundPairsSequential(
    tla
      .morphAnalyze(wrd.literal, new TonalUncombiningForms([]))
      .map((x) => x.sounds)
  );

  return pairs;
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
      const syllables = analyzeIntoSyllables(input);

      const kanas: string[] = [];
      const syle: string[] = [];

      if (syllables.length == 0) {
        for (const key of keys) {
          if (key === input) {
            const arr: string[] = dict[key];
            // console.info(arr[1]);
            kanas.push(arr[1]);
          }
        }
      } else {
        syllables.forEach((ltrSndPairs) => {
          syle.length = 0; // reset the array
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
              if (pair[1] === TonalSpellingTags.stopFinalConsonant) {
                // the 4th tone, 8th tone
                if (
                  pair[0] !== TonalLetterTags.h &&
                  pair[0] !== TonalLetterTags.hh
                ) {
                  // in case of stop finals other than h, hh
                  // could be 4th or 8th tone
                  syle.push(fldValue[1]);
                  if (tnl.length == 0 && pair[0].length == 1) {
                    // push 4th tone mark, if present in json
                    syle.push(dict[TonalLetterTags.h][3]);
                  }
                } else {
                  // in case of stop final h, hh
                  // could be 4th or 8th tone
                  if (nslztn.length > 0 && tnl.length == 0) {
                    // in case of nasalization
                    syle.push(fldValue[2]);
                  } else {
                    syle.push(fldValue[1]);
                    if (tnl.length == 0 && pair[0].length == 1) {
                      // push 4th tone mark, if present in json
                      syle.push(fldValue[3]);
                    }
                  }
                }
              } else if (
                idx > 0 &&
                arrPairs[idx - 1][1] === TonalSpellingTags.initialConsonant &&
                pair[1] === TonalSpellingTags.vowel
              ) {
                // in case of preceding initial and vowel
                syle.pop(); // pop initial
                if (
                  pair[0] === TonalLetterTags.a ||
                  pair[0] === TonalLetterTags.i ||
                  pair[0] === TonalLetterTags.u ||
                  pair[0] === TonalLetterTags.o
                ) {
                  // in case of a, i, u, o
                  // push syllabogram
                  syle.push(dict[arrPairs[idx - 1][0] + pair[0]][0]);
                } else if (pair[0] === TonalLetterTags.e) {
                  // in case of e
                  const fnl = arrPairs.filter(
                    (it) =>
                      (it[0] === TonalLetterTags.k ||
                        it[0] === TonalLetterTags.kk) &&
                      it[1] === TonalSpellingTags.stopFinalConsonant
                  );
                  if (fnl.length > 0) {
                    // in case of ~ek
                    // push pi, ti, ki, etc.
                    if (pair[0].length == 1)
                      syle.push(
                        dict[arrPairs[idx - 1][0] + TonalLetterTags.i][0]
                      );
                    else
                      syle.push(
                        dict[arrPairs[idx - 1][0] + TonalLetterTags.i][1]
                      );
                    syle.push(fldValue[1]); // push small kana e
                  } else {
                    // in case of e. not ~ek or ~ekk
                    // push kana
                    syle.push(dict[arrPairs[idx - 1][0] + pair[0]][0]);
                  }
                } else {
                  // in case of ur, or, er, ir
                  // push syllabogram
                  syle.push(dict[arrPairs[idx - 1][0] + TonalLetterTags.o][0]);
                  // push one more syllabogram
                  // bc this letter is not one of a, i, u, e, o
                  syle.push(fldValue[1]); // push small kana
                }
              } else if (
                pair[1] === TonalSpellingTags.freeTone ||
                pair[1] === TonalSpellingTags.checkedTone
              ) {
                // in case of tone
                // in case of nasalization
                if (nslztn.length > 0)
                  syle.push(fldValue[1]); // push nasalized tone mark
                else syle.push(fldValue[0]);
              } else if (pair[1] === TonalSpellingTags.nasalization) {
                // in case of nasalization
                if (tnl.length == 0 && stpFnl.length == 0) {
                  // in case of no tone letters, aka first tone
                  syle.push(fldValue[2]); // push nasalized tone mark
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

                  syle.push(fldValue[1]); // push the small kana
                } else if (
                  init.length == 1 &&
                  vwls.length == 0 &&
                  nslFnl.length == 1
                ) {
                  // in case of sng, kng, mnghh, etc.
                  if (
                    fldValue.length > 0 &&
                    pair[1] === TonalSpellingTags.nasalFinalConsonant
                  )
                    syle.push(fldValue[1]);
                  else if (
                    fldValue.length > 0 &&
                    pair[1] === TonalSpellingTags.initialConsonant
                  ) {
                    // in case of initial consonant
                    // push su for s, ku for k, etc.
                    syle.push(dict[pair[0] + TonalLetterTags.u][0]);
                  }
                } else if (mtrLctns.length > 0) {
                  syle.push(fldValue[0]);
                } else if (
                  init.length == 0 &&
                  pair[0] === TonalLetterTags.e &&
                  stpFnl.length > 0 &&
                  (arrPairs[idx + 1][0] === TonalLetterTags.k ||
                    arrPairs[idx + 1][0] === TonalLetterTags.kk)
                ) {
                  // in case of ek or ekk. no initial
                  syle.push(dict[TonalLetterTags.i][0]); // push i
                  syle.push(dict[TonalLetterTags.e][1]); // push small e
                } else {
                  syle.push(fldValue[0]);
                }
              }
            } else {
              // in case of initial consonant
              // in case of no matched field keys in json
              // in case of chu for chng, thng, khngw
              syle.push(dict[pair[0] + TonalLetterTags.u][0]);
            }
          });
          kanas.push(syle.join(''));
        });
      }

      console.info(kanas.join(''));
    }
  }
});
