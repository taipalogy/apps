import * as fs from 'fs';

const stdin = process.openStdin();

const fileContents = fs.readFileSync(process.argv[2], 'utf-8');
const dict: string[] = JSON.parse(fileContents) || [];
const keys = Object.keys(dict);

// Analyze a syllable and get sub-syllable members.
function analyzeSyllable(sequence: string): string[] {
  const result: string[] = [];
  let longestVal = '';

  while (sequence.length > 0) {
    keys.forEach((val) => {
      if (sequence.startsWith(val) && val.length > longestVal.length) {
        longestVal = val;
      }
    });
    if (longestVal.length == 0) break;
    // console.log('>' + sequence);
    sequence = sequence.slice(longestVal.length);
    // console.log('>' + sequence);
    result.push(longestVal);
    longestVal = '';
  }

  console.log('>' + result + '>' + sequence);
  return result;
}

if (process.argv.length == 3) {
  if (!fs.existsSync(process.argv[2])) {
    console.log('File not found');
  }
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
      const input = data.toString().trim();
      const result = analyzeSyllable(input);

      // Output the sub-syllable members
      // console.log(result);
      console.info(
        result
          .map((val, ind) => (ind == 0 ? dict[val][0] : dict[val][1]))
          .join('')
      );
    }
  } else {
    console.log('Usage: node path/to/transliterate from.json');
  }
});
