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
