import { Client, TokenAnalysis } from '../taipa/src/client';
import { tonalLemmatizationAnalyzer } from '../taipa/src/unchange/analyzer';
import { TonalUncombiningForms } from '../taipa/src/unchange/metaplasm';
import { TonalWord } from '../taipa/src/unchange/unit';
import { getLetterSoundPairs } from '../taipa/src/util';

import * as fs from 'fs';

/**
 * > node path/to/poj.js
 */

// ́: U+0301 Combining Acute Accent
// ̀: U+0300 Combining Grave Accent
// ̂: U+0302 Combining Circumflex Accent
// ¯: U+00AF Macron
// ͘: U+0358 Combining Dot Above Right
// ⁿ: U+207F Superscript Latin Small Letter N

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
      const dict = JSON.parse(fileContents) || {};
      const keys = Object.keys(dict);
      const ltrSndPairs = analyze(input);

      const poj: string[] = [];
      if (ltrSndPairs.length == 0) {
        for (const key of keys) {
          if (key === input) {
            const chr: string = dict[key];
            poj.push(chr);
          }
        }
      } else {
        ltrSndPairs.forEach((pair: [string, string], idx, arrPairs) => {
          for (const key of keys) {
            if (key === pair[0]) {
              const chr: string = dict[key] || {};
              poj.push(chr);
            }
          }
        });
      }

      console.info(poj.join(''));
    }
  }
});
