import { TonalSpellingTags } from '../taipa/src/tonal/tonalres';

// Analyze a syllable and get sub-syllable members.
export function getSubSyllableMembers(
  sequence: string,
  keys: string[]
): string[] {
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

  // console.log('>' + result + '>' + sequence);
  return result;
}

export function getInitial(
  ltrSndPairs: [string, string][]
): [string, string][] {
  return ltrSndPairs.filter(
    (it) => it[1] === TonalSpellingTags.initialConsonant
  );
}

export function getVowels(ltrSndPairs: [string, string][]): [string, string][] {
  return ltrSndPairs.filter((it) => it[1] === TonalSpellingTags.vowel);
}

export function getMaterLectionis(
  ltrSndPairs: [string, string][]
): [string, string][] {
  return ltrSndPairs.filter((it) => it[1] === TonalSpellingTags.materLectionis);
}

export function getNasalFinalConsonant(
  ltrSndPairs: [string, string][]
): [string, string][] {
  return ltrSndPairs.filter(
    (it) => it[1] === TonalSpellingTags.nasalFinalConsonant
  );
}

export function getNasalization(
  ltrSndPairs: [string, string][]
): [string, string][] {
  return ltrSndPairs.filter((it) => it[1] === TonalSpellingTags.nasalization);
}

export function getStopFinalConsonant(
  ltrSndPairs: [string, string][]
): [string, string][] {
  return ltrSndPairs.filter(
    (it) => it[1] === TonalSpellingTags.stopFinalConsonant
  );
}

export function getTonal(ltrSndPairs: [string, string][]): [string, string][] {
  return ltrSndPairs.filter(
    (it) =>
      it[1] === TonalSpellingTags.freeTone ||
      it[1] === TonalSpellingTags.checkedTone
  );
}
