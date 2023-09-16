import * as fs from 'fs';

const stdin = process.openStdin();

// Define your transList to transliterate hangul
// prettier-ignore
const transList: string[] = [
  'a', 'ar', 
  'b', 'ba', 'bar', 'bi', 'bir', 'bu', 'be', 'bo', 'bur', 'bs', 
  'cca', 'ccar', 'cce', 'cci', 'ccir', 'cco', 'ccu', 'ccur', 
  'ch', 'cha', 'char', 'che', 'chi', 'chir', 'cho', 'chu', 'chur', 
  'd', 'da', 'dar', 'di', 'dir', 'du', 'de', 'do', 'dur', 
  'e', 
  'g', 'ga', 'gar', 'gi', 'gir', 'gu', 'ge', 'go', 'gur', 'gs', 
  'h', 
  'i', 'ir', 
  'j', 'ja', 'jar', 'ji', 'jir', 'ju', 'je', 'jo', 'jur', 
  'k', 'kk', 'ka', 'kar', 'ke', 'ki', 'kir', 'ko', 'ku', 'kur', 
  'kka', 'kkar', 'kke', 'kki', 'kkir', 'kko', 'kku', 'kkur', 
  'l', 'lb', 'lg', 'lh', 'lm', 'lp', 'ls', 'lt', 
  'm', 
  'n', 'nh', 'nj', 
  'ng', 
  'o', 
  'p', 'pa', 'par', 'pe', 'pi', 'pir', 'po', 'pu', 'pur', 
  'ppa', 'ppar', 'ppe', 'ppi', 'ppir', 'ppo', 'ppu', 'ppur', 
  's', 'ss', 
  't', 'ta', 'tar', 'te', 'ti', 'tir', 'to', 'tu', 'tur', 
  'tta', 'ttar', 'tte', 'tti', 'ttir', 'tto', 'ttu', 'ttur', 
  'u', 'ur'
];

// Analyze a syllable and get sub-syllable members.
function analyzeSyllable(sequence: string): string[] {
  const result: string[] = [];
  let longestVal = '';

  while (sequence.length > 0) {
    transList.forEach((val) => {
      if (sequence.startsWith(val) && val.length > longestVal.length) {
        longestVal = val;
      }
    });
    if (longestVal.length == 0) break;
    console.log('>' + sequence);
    sequence = sequence.slice(longestVal.length);
    console.log('>' + sequence);
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
    const letterSequence = data.toString().trim();
    const result = analyzeSyllable(letterSequence);
    // Output the sub-syllable members
    console.log(result);
  } else if (process.argv.length == 3) {
    if (!fs.existsSync(process.argv[2])) {
      console.log('File not found');
    } else {
      const input = data.toString().trim();
      const fileContents = fs.readFileSync(process.argv[2], 'utf-8');
      const dict: string[] = JSON.parse(fileContents) || [];
      const keys = Object.keys(dict);
    }
  } else {
    console.log('Usage: ');
  }
});
