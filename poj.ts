import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
import { getLetterSoundPairs } from '../taipa/src/util';

import * as fs from 'fs';
import {
  TonalLetterTags,
  TonalSpellingTags,
} from '../taipa/src/tonal/tonalres';

/**
 * > node path/to/poj.js
 */

// ́: U+0301 Combining Acute Accent
// ̀: U+0300 Combining Grave Accent
// ̂: U+0302 Combining Circumflex Accent
// ̄: U+0304 Combining Macron
// ̍: U+030D COMBINING VERTICAL LINE ABOVE
// ⁿ: U+207F Superscript Latin Small Letter N
// U+0358 COMBINING DOT ABOVE RIGHT
// U+1D3A MODIFIER LETTER CAPITAL N

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

stdin.addListener('data', function (d) {
  if (process.argv.length == 2) {
    analyze(d.toString()).forEach((v) => {
      console.info(v[0] + ' - ' + v[1]);
    });
  } else if (process.argv.length == 3) {
    if (!fs.existsSync(process.argv[2])) {
      console.log('File not found');
    } else {
      const input = d.toString().trim();
      const fileContents = fs.readFileSync(process.argv[2], 'utf-8');
      const dict = JSON.parse(fileContents) || [];
      const keys = Object.keys(dict);
      const ltrSndPairs = analyze(input);

      const poj: string[] = [];
      if (ltrSndPairs.length == 0) {
        if (keys.includes(input)) {
          const chr: string = dict[input];
          poj.push(chr);
        }
      } else {
        ltrSndPairs.forEach((pair: [string, string], idx, arrPairs) => {
          if (keys.includes(pair[0])) {
            const chr: string = dict[pair[0]] || '';
            // const numVowels = ltrSndPairs.filter(
            //   (pr) => pr[1] === TonalSpellingTags.vowel
            // ).length;
            // const numNasalFinals = ltrSndPairs.filter(
            //   (pr) => pr[1] === TonalSpellingTags.nasalFinalConsonant
            // ).length;
            const numTonals = ltrSndPairs.filter(
              (pr) =>
                pr[1] === TonalSpellingTags.freeTone ||
                pr[1] === TonalSpellingTags.checkedTone
            ).length;
            if (pair[1] === TonalSpellingTags.vowel && numTonals == 0) {
              poj.push(chr);
            } else if (pair[1] === TonalSpellingTags.vowel && numTonals == 1) {
              if (pair[0] !== TonalLetterTags.o) {
                poj.push(chr);
              } else {
                poj.push(dict[TonalLetterTags.ur]);
              }
              const tn = ltrSndPairs
                .map((pr) => {
                  if (
                    pr[1] === TonalSpellingTags.freeTone ||
                    pr[1] === TonalSpellingTags.checkedTone
                  ) {
                    return pr[0];
                  }
                })
                .join('');
              poj.push(dict[tn]);
              if (pair[0] === TonalLetterTags.o) {
                poj.push('\u0358');
              }
            } else if (
              pair[1] === TonalSpellingTags.initialConsonant ||
              pair[1] === TonalSpellingTags.nasalFinalConsonant ||
              pair[1] === TonalSpellingTags.stopFinalConsonant
            ) {
              poj.push(chr);
            }
          }
        });
      }

      console.info(poj.join(''));
    }
  }
});
