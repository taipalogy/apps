import { Client, TokenAnalysis } from '../taipa/src/client';

/**
 * > node path/to/taikana.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (d) {
  if (process.argv.length == 2) {
    const cli = new Client();
    const ta: TokenAnalysis = cli.processTonal(d.toString().trim());

    // console.log(
    //   ta.soundSequences
    //     .flatMap((v) => {
    //       return v;
    //     })
    //     .map((v) => v.toString() + ' - ' + v.name)
    // );
    console.info(ta.blockSequences.pop());
  }
});
