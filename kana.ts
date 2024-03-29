import { Client, TokenAnalysis } from '../taipa/src/client';

/**
 * > node path/to/kana.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const cli = new Client();
    const ta: TokenAnalysis = cli.processKana(data.toString().trim());
    ta.blockSequences.forEach((v) => {
      if (v.length > 0) console.info(v);
    });
  }
});
