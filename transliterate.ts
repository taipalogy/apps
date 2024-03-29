import * as fs from 'fs';
import { getSubSyllableMembers } from './utility';

const stdin = process.openStdin();

if (process.argv.length == 3) {
  if (!fs.existsSync(process.argv[2])) {
    console.log('File not found');
  }
}

interface SyllabaryType {
  [key: string]: string[];
}

// Process command line input
stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    // const letterSequence = data.toString().trim();
    // const result = analyzeSyllable(letterSequence);
  } else if (process.argv.length == 3) {
    if (!fs.existsSync(process.argv[2])) {
      console.log('File not found');
    } else {
      const fileContents = fs.readFileSync(process.argv[2], 'utf-8');
      const dict: SyllabaryType = JSON.parse(fileContents) || [];
      const keys = Object.keys(dict);

      const input = data.toString().trim();
      const result = getSubSyllableMembers(input, keys);

      // Output the sub-syllable members
      // console.log(result);
      console.info(
        result
          .map((val, ind) => (ind == 0 ? dict[val][0] : dict[val][1]))
          .join('')
      );
    }
  } else {
    console.info('Usage: node path/to/transliterate.js fromLang.json');
  }
});
