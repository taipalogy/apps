import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
import { getLetterSoundPairs } from '../taipa/src/util';

import * as fs from 'fs';
import { ToneLetterTags, TonalSpellingTags } from '../taipa/src/tonal/tonalres';

/**
 * > node path/to/poj.js
 */

// ́: U+0301 Combining Acute Accent
// ̀: U+0300 Combining Grave Accent
// ̂: U+0302 Combining Circumflex Accent
// ̄: U+0304 Combining Macron
// ̍: U+030D COMBINING VERTICAL LINE ABOVE
// ⁿ: U+207F Superscript Latin Small Letter N
// ͘: U+0358 COMBINING DOT ABOVE RIGHT
// ᴺ: U+1D3A MODIFIER LETTER CAPITAL N

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

            if (pair[1] === TonalSpellingTags.vowel) {
              if (pair[0] !== ToneLetterTags.o) {
                poj.push(chr);
              } else {
                poj.push(dict[ToneLetterTags.ur]);
              }

              if (pair[0] === ToneLetterTags.o) {
                poj.push('\u0358');
              }
            } else if (
              pair[1] === TonalSpellingTags.initialConsonant ||
              pair[1] === TonalSpellingTags.nasalFinalConsonant ||
              pair[1] === TonalSpellingTags.stopFinalConsonant
            ) {
              poj.push(chr);
            } else if (
              pair[1] === TonalSpellingTags.freeTone ||
              pair[1] === TonalSpellingTags.checkedTone
            ) {
              const fnls: string[] = [];
              let i = idx - 1;

              while (
                i >= 0 &&
                (arrPairs[i][1] === TonalSpellingTags.nasalFinalConsonant ||
                  arrPairs[i][1] === TonalSpellingTags.stopFinalConsonant ||
                  arrPairs[i][1] === TonalSpellingTags.nasalization)
              ) {
                fnls.unshift(dict[arrPairs[i][0]]);
                poj.pop();
                // console.log(i, arrPairs[i][1], poj, fnls);
                i--;
              }

              // console.log('>' + poj + '>' + chr + '>' + fnls);

              if (
                arrPairs[idx - 1][1] === TonalSpellingTags.materLectionis &&
                arrPairs[idx - 1][0].length == 2
              ) {
                // in case of ng, rather than m, n
                const fl = arrPairs[idx - 1][0].slice(0, 1); // first letter, n
                const sl = arrPairs[idx - 1][0].slice(1, 2); // second letter, g
                poj.pop(); // pop ng
                poj.push(fl); // push n
                poj.push(chr); // push tone
                poj.push(sl); // push g
              } else if (
                arrPairs[i][1] === TonalSpellingTags.initialConsonant
              ) {
                // in case of an initial followed by a nasal final
                const fl = arrPairs[idx - 1][0].slice(0, 1); // first letter, n
                const sl = arrPairs[idx - 1][0].slice(1, 2); // second letter, g
                poj.push(fl); // push n
                poj.push(chr); // push tone
                poj.push(sl); // push g
              } else {
                poj.push(chr); // push the tone mark to be combined with the vowels
                poj.push(fnls.join('')); // push the finals
              }
            } else if (pair[1] === TonalSpellingTags.nasalization) {
              console.log('>' + poj + '>' + chr);
              poj.push(chr);
            } else if (pair[1] === TonalSpellingTags.materLectionis) {
              poj.push(chr);
            }
          }
        });
      }

      console.info(poj.join(''));
    }
  }
});
