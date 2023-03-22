import { Client, TokenAnalysis } from '../taipa/src/client';

/**
 * > node path/to/taikana.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (d) {
  if (process.argv.length == 2) {
    const cli = new Client();
    const ta: TokenAnalysis = cli.processTonal(d.toString().trim());

    ta.blockSequences.map((v) => console.info(v));
  }
});
